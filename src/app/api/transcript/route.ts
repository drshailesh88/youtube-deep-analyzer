import { NextRequest, NextResponse } from 'next/server';
import { getTranscript } from '@/lib/transcript';
import { formatTimestampFromMs } from '@/lib/utils';
import { FormattedTranscript, TranscriptSegment } from '@/lib/types';

export const maxDuration = 60;

function processTranscript(segments: Array<{text: string; start?: number; duration?: number}>): FormattedTranscript {
  // Convert to our format (milliseconds)
  const formattedSegments: TranscriptSegment[] = segments.map(seg => ({
    text: seg.text,
    offset: seg.start ? Math.floor(seg.start * 1000) : 0,
    duration: seg.duration ? Math.floor(seg.duration * 1000) : 0
  }));

  // Build full text
  const fullText = formattedSegments.map(s => s.text).join(' ');

  // Calculate total duration
  const lastSegment = formattedSegments[formattedSegments.length - 1];
  const totalDuration = lastSegment ? lastSegment.offset + lastSegment.duration : 0;

  // Create sections (roughly every 2 minutes)
  const sections = [];
  const SECTION_DURATION = 120000; // 2 minutes in ms
  let sectionContent: string[] = [];
  let sectionStart = 0;

  for (const segment of formattedSegments) {
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
    segments: formattedSegments,
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

    console.log(`[Transcript] Fetching for URL: ${url}`);

    try {
      const result = await getTranscript(url);

      if (result.success && result.segments && result.segments.length > 0) {
        const formattedTranscript = processTranscript(result.segments);

        console.log(`[Transcript] ✅ Success via ${result.source}: ${result.segments.length} segments, ${formattedTranscript.fullText.split(/\s+/).length} words`);

        return NextResponse.json({
          success: true,
          transcript: formattedTranscript,
          source: result.source,
          videoTitle: result.videoTitle
        });
      } else {
        console.log(`[Transcript] ❌ Failed: ${result.error || 'No segments returned'}`);

        // Return graceful failure - transcript is optional
        return NextResponse.json({
          success: false,
          error: result.error || 'Transcript not available',
          message: 'Captions may be disabled or auto-generated captions not available. Analysis will proceed with comments only.'
        });
      }

    } catch (transcriptError) {
      console.error('[Transcript] Error:', transcriptError);

      // Return graceful failure - transcript is optional
      return NextResponse.json({
        success: false,
        error: 'Transcript not available',
        message: 'Captions may be disabled or auto-generated captions not available. Analysis will proceed with comments only.'
      });
    }

  } catch (error) {
    console.error('[Transcript] API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
