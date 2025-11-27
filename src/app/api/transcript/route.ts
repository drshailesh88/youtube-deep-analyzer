import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, formatTimestampFromMs } from '@/lib/utils';
import { FormattedTranscript, TranscriptSegment } from '@/lib/types';

export const maxDuration = 60;

// We'll use the youtube-transcript package which fetches from YouTube's unofficial API
async function fetchTranscriptDirect(videoId: string): Promise<TranscriptSegment[]> {
  // Dynamic import to handle server-side only
  const { YoutubeTranscript } = await import('youtube-transcript');
  
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en'
    });
    
    return transcript.map(item => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration
    }));
  } catch (error) {
    // Try without language preference
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    return transcript.map(item => ({
      text: item.text,
      offset: item.offset,
      duration: item.duration
    }));
  }
}

function processTranscript(segments: TranscriptSegment[]): FormattedTranscript {
  // Build full text
  const fullText = segments.map(s => s.text).join(' ');
  
  // Calculate total duration
  const lastSegment = segments[segments.length - 1];
  const totalDuration = lastSegment ? lastSegment.offset + lastSegment.duration : 0;
  
  // Create sections (roughly every 2 minutes or based on natural breaks)
  const sections = [];
  let currentSection = {
    startTime: 0,
    endTime: 0,
    title: '',
    content: '',
    timestamp: '0:00'
  };
  
  const SECTION_DURATION = 120000; // 2 minutes in ms
  let sectionContent: string[] = [];
  let sectionStart = 0;
  
  for (const segment of segments) {
    sectionContent.push(segment.text);
    
    // Check if we should create a new section
    if (segment.offset - sectionStart >= SECTION_DURATION) {
      const content = sectionContent.join(' ');
      sections.push({
        startTime: sectionStart,
        endTime: segment.offset,
        title: `Section ${sections.length + 1}`,
        content: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
        timestamp: formatTimestampFromMs(sectionStart)
      });
      
      sectionStart = segment.offset;
      sectionContent = [];
    }
  }
  
  // Add final section
  if (sectionContent.length > 0) {
    const content = sectionContent.join(' ');
    sections.push({
      startTime: sectionStart,
      endTime: totalDuration,
      title: `Section ${sections.length + 1}`,
      content: content.slice(0, 500) + (content.length > 500 ? '...' : ''),
      timestamp: formatTimestampFromMs(sectionStart)
    });
  }
  
  return {
    segments,
    fullText,
    sections,
    totalDuration
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log(`Fetching transcript for video: ${videoId}`);

    try {
      const segments = await fetchTranscriptDirect(videoId);
      
      if (!segments || segments.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No transcript available',
          message: 'This video may not have captions/subtitles enabled'
        });
      }

      const formattedTranscript = processTranscript(segments);
      
      console.log(`Transcript fetched: ${segments.length} segments, ${formattedTranscript.fullText.split(/\s+/).length} words`);

      return NextResponse.json({
        success: true,
        transcript: formattedTranscript
      });

    } catch (transcriptError) {
      console.error('Transcript fetch error:', transcriptError);
      
      // Return graceful failure - transcript is optional
      return NextResponse.json({
        success: false,
        error: 'Transcript not available',
        message: 'Captions may be disabled or auto-generated captions not available. Analysis will proceed with comments only.'
      });
    }

  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
