"""
YouTube Transcript Service - Microservice for reliable transcript fetching
Uses the robust youtube-transcript-api Python package
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
    YouTubeRequestFailed
)
import re
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js API calls

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_video_id(url_or_id):
    """Extract video ID from URL or return as-is if already an ID"""
    if not url_or_id:
        return None

    # If it's already just an ID (11 characters, alphanumeric with - and _)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id

    # Extract from various YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be\/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})',
    ]

    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)

    return None

def format_timestamp_from_ms(ms):
    """Convert milliseconds to MM:SS format"""
    seconds = int(ms / 1000)
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes}:{secs:02d}"

def process_transcript(segments):
    """Process raw transcript segments into structured format"""
    if not segments:
        return None

    # Build full text
    full_text = ' '.join([s['text'] for s in segments])

    # Calculate total duration
    last_segment = segments[-1]
    total_duration = int(last_segment['start'] * 1000) + int(last_segment.get('duration', 0) * 1000)

    # Create sections (every 2 minutes)
    SECTION_DURATION = 120  # 120 seconds = 2 minutes
    sections = []
    current_section_content = []
    section_start = 0

    for segment in segments:
        current_section_content.append(segment['text'])
        segment_time = segment['start']

        # Check if we should create a new section
        if segment_time - section_start >= SECTION_DURATION:
            content = ' '.join(current_section_content)
            sections.append({
                'startTime': int(section_start * 1000),  # Convert to ms
                'endTime': int(segment_time * 1000),
                'title': f"Section {len(sections) + 1}",
                'content': content[:500] + ('...' if len(content) > 500 else ''),
                'timestamp': format_timestamp_from_ms(int(section_start * 1000))
            })

            section_start = segment_time
            current_section_content = []

    # Add final section
    if current_section_content:
        content = ' '.join(current_section_content)
        sections.append({
            'startTime': int(section_start * 1000),
            'endTime': total_duration,
            'title': f"Section {len(sections) + 1}",
            'content': content[:500] + ('...' if len(content) > 500 else ''),
            'timestamp': format_timestamp_from_ms(int(section_start * 1000))
        })

    # Convert segments to expected format (offset in ms)
    formatted_segments = [
        {
            'text': s['text'],
            'offset': int(s['start'] * 1000),
            'duration': int(s.get('duration', 0) * 1000)
        }
        for s in segments
    ]

    return {
        'segments': formatted_segments,
        'fullText': full_text,
        'sections': sections,
        'totalDuration': total_duration
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'youtube-transcript-service'})

@app.route('/transcript', methods=['POST'])
def get_transcript():
    """Fetch transcript for a YouTube video"""
    try:
        data = request.get_json()

        if not data or 'url' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: url'
            }), 400

        video_id = extract_video_id(data['url'])

        if not video_id:
            return jsonify({
                'success': False,
                'error': 'Invalid YouTube URL or video ID'
            }), 400

        logger.info(f"Fetching transcript for video: {video_id}")

        # Try to fetch transcript using the new API (v1.2.3+)
        # Priority: English -> Any available language
        try:
            # Create API instance
            ytt_api = YouTubeTranscriptApi()

            # Try to fetch English transcript (manual or auto-generated)
            try:
                fetched = ytt_api.fetch(video_id, languages=['en'])
                # FetchedTranscript is iterable, convert snippets to dict format
                segments = [
                    {
                        'text': snippet.text,
                        'start': snippet.start,
                        'duration': snippet.duration
                    }
                    for snippet in fetched
                ]
                logger.info(f"Found English transcript with {len(segments)} segments")
            except Exception:
                # Try any available language
                try:
                    fetched = ytt_api.fetch(video_id, languages=['en', 'de', 'es', 'fr', 'pt', 'hi', 'ja', 'ko'])
                    segments = [
                        {
                            'text': snippet.text,
                            'start': snippet.start,
                            'duration': snippet.duration
                        }
                        for snippet in fetched
                    ]
                    logger.info(f"Found transcript with {len(segments)} segments")
                except Exception as e:
                    logger.warning(f"No transcripts available for {video_id}: {str(e)}")
                    return jsonify({
                        'success': False,
                        'error': 'No transcript available',
                        'message': 'This video may not have captions/subtitles enabled'
                    }), 404

        except Exception as fetch_error:
            logger.warning(f"Failed to fetch transcript for {video_id}: {str(fetch_error)}")
            return jsonify({
                'success': False,
                'error': 'No transcript available',
                'message': 'This video may not have captions/subtitles enabled'
            }), 404

        # Process the transcript
        formatted_transcript = process_transcript(segments)

        if not formatted_transcript:
            return jsonify({
                'success': False,
                'error': 'Failed to process transcript'
            }), 500

        logger.info(f"Successfully processed transcript: {len(segments)} segments, {len(formatted_transcript['fullText'].split())} words")

        return jsonify({
            'success': True,
            'transcript': formatted_transcript
        })

    except TranscriptsDisabled:
        logger.warning(f"Transcripts disabled for video")
        return jsonify({
            'success': False,
            'error': 'Transcripts disabled',
            'message': 'The video owner has disabled transcripts for this video'
        }), 403

    except VideoUnavailable:
        logger.warning(f"Video unavailable")
        return jsonify({
            'success': False,
            'error': 'Video unavailable',
            'message': 'The video is private, deleted, or does not exist'
        }), 404

    except YouTubeRequestFailed as e:
        logger.error(f"YouTube request failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'YouTube request failed',
            'message': 'Failed to fetch data from YouTube. Please try again.'
        }), 502

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Run on port 3006
    app.run(host='0.0.0.0', port=3006, debug=True)
