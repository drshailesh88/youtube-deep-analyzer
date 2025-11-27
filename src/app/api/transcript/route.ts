import { NextRequest, NextResponse } from 'next/server';
import { FormattedTranscript } from '@/lib/types';

export const maxDuration = 60;

// URL of the Python transcript service
// For local development: http://localhost:3006
// For production: Set TRANSCRIPT_SERVICE_URL environment variable
const TRANSCRIPT_SERVICE_URL = process.env.TRANSCRIPT_SERVICE_URL || 'http://localhost:3006';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching transcript for video URL: ${url}`);

    try {
      // Call Python transcript service
      const serviceResponse = await fetch(`${TRANSCRIPT_SERVICE_URL}/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(55000), // 55 second timeout (less than route maxDuration)
      });

      const data = await serviceResponse.json();

      if (!serviceResponse.ok) {
        console.warn(`Transcript service returned ${serviceResponse.status}:`, data);

        // Return graceful failure - transcript is optional
        return NextResponse.json({
          success: false,
          error: data.error || 'Transcript not available',
          message: data.message || 'Captions may be disabled or auto-generated captions not available. Analysis will proceed with comments only.'
        });
      }

      if (data.success && data.transcript) {
        const transcript = data.transcript as FormattedTranscript;
        console.log(`Transcript fetched: ${transcript.segments.length} segments, ${transcript.fullText.split(/\s+/).length} words`);

        return NextResponse.json({
          success: true,
          transcript
        });
      }

      // Unexpected response format
      return NextResponse.json({
        success: false,
        error: 'Unexpected response from transcript service'
      });

    } catch (transcriptError) {
      console.error('Transcript fetch error:', transcriptError);

      // Check if it's a timeout error
      if (transcriptError instanceof Error && transcriptError.name === 'TimeoutError') {
        return NextResponse.json({
          success: false,
          error: 'Transcript fetch timeout',
          message: 'The transcript service took too long to respond. Analysis will proceed with comments only.'
        });
      }

      // Check if it's a connection error
      if (transcriptError instanceof Error && transcriptError.message.includes('ECONNREFUSED')) {
        return NextResponse.json({
          success: false,
          error: 'Transcript service unavailable',
          message: 'Could not connect to transcript service. Please ensure it is running. Analysis will proceed with comments only.'
        });
      }

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
