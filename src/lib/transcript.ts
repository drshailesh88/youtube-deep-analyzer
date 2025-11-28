/**
 * YouTube Transcript Fetcher with Tiered Fallback
 *
 * Tier 1: youtube-transcript-api (free, uses youtube-transcript.io)
 * Tier 2: Supadata API (100 free/month, reliable)
 * Tier 3: Gemini API (AI transcription, works on any video)
 */

interface TranscriptSegment {
  text: string;
  start?: number;
  duration?: number;
}

interface TranscriptResult {
  success: boolean;
  transcript: string;
  segments?: TranscriptSegment[];
  source: 'youtube-transcript-io' | 'supadata' | 'gemini' | 'none';
  videoTitle?: string;
  error?: string;
}

/**
 * Extract video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Tier 1: Free method using youtube-transcript.io workaround
 */
async function fetchFromYoutubeTranscriptIO(videoId: string): Promise<TranscriptResult | null> {
  try {
    const { default: TranscriptClient } = await import('youtube-transcript-api');

    const client = new TranscriptClient();
    await client.ready;

    const result = await client.getTranscript(videoId);

    if (result.tracks && result.tracks.length > 0 && result.tracks[0].transcript?.length > 0) {
      const segments = result.tracks[0].transcript.map((seg: any) => ({
        text: seg.text,
        start: parseFloat(seg.start),
        duration: parseFloat(seg.dur)
      }));

      return {
        success: true,
        transcript: segments.map((s: TranscriptSegment) => s.text).join(' '),
        segments,
        source: 'youtube-transcript-io',
        videoTitle: result.title
      };
    }

    return null;
  } catch (error) {
    console.log('[Transcript] Tier 1 failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Tier 2: Supadata API (100 free requests/month)
 */
async function fetchFromSupadata(videoId: string): Promise<TranscriptResult | null> {
  const apiKey = process.env.SUPADATA_API_KEY;

  if (!apiKey) {
    console.log('[Transcript] Tier 2 skipped: No API key');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.supadata.ai/v1/transcript?url=https://www.youtube.com/watch?v=${videoId}`,
      { headers: { 'x-api-key': apiKey } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.content && Array.isArray(data.content) && data.content.length > 0) {
      const segments = data.content.map((item: any) => ({
        text: item.text,
        start: item.offset ? item.offset / 1000 : undefined,
        duration: item.duration ? item.duration / 1000 : undefined
      }));

      return {
        success: true,
        transcript: segments.map((s: TranscriptSegment) => s.text).join(' '),
        segments,
        source: 'supadata'
      };
    }

    return null;
  } catch (error) {
    console.log('[Transcript] Tier 2 failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Tier 3: Gemini API (AI transcription)
 */
async function fetchFromGemini(videoId: string): Promise<TranscriptResult | null> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[Transcript] Tier 3 skipped: No API key');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Transcribe this video verbatim. Return ONLY the spoken dialogue, word for word. No descriptions or timestamps." },
              { file_data: { file_uri: `https://www.youtube.com/watch?v=${videoId}` } }
            ]
          }]
        })
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (transcript && transcript.trim().length > 0) {
      return {
        success: true,
        transcript: transcript.trim(),
        source: 'gemini'
      };
    }

    return null;
  } catch (error) {
    console.log('[Transcript] Tier 3 failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Main function: Fetch transcript with tiered fallback
 */
export async function getTranscript(videoIdOrUrl: string): Promise<TranscriptResult> {
  const videoId = extractVideoId(videoIdOrUrl) || videoIdOrUrl;

  if (!videoId || videoId.length !== 11) {
    return { success: false, transcript: '', source: 'none', error: 'Invalid video ID' };
  }

  // Tier 1
  const tier1 = await fetchFromYoutubeTranscriptIO(videoId);
  if (tier1) return tier1;

  // Tier 2
  const tier2 = await fetchFromSupadata(videoId);
  if (tier2) return tier2;

  // Tier 3
  const tier3 = await fetchFromGemini(videoId);
  if (tier3) return tier3;

  return { success: false, transcript: '', source: 'none', error: 'All transcript methods failed' };
}
