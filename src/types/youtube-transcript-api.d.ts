declare module 'youtube-transcript-api' {
  interface TranscriptSegment {
    text: string;
    start: string;
    dur: string;
  }

  interface Track {
    language: string;
    transcript: TranscriptSegment[];
  }

  interface TranscriptResult {
    id: string;
    title: string;
    tracks: Track[];
    isLive: boolean;
    languages: Array<{ label: string; languageCode: string }>;
  }

  class TranscriptClient {
    constructor();
    ready: Promise<void>;
    getTranscript(videoId: string): Promise<TranscriptResult>;
  }

  export default TranscriptClient;
}
