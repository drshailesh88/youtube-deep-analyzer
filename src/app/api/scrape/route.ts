import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/utils';
import { google } from 'googleapis';

export const maxDuration = 300; // 5 minutes timeout

const youtube = google.youtube('v3');

export async function POST(request: NextRequest) {
  try {
    const { url, maxComments = 2000 } = await request.json();

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

    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'YouTube Data API key not configured' },
        { status: 500 }
      );
    }

    console.log(`Fetching video data for: ${videoId}`);

    // Fetch video metadata
    const videoResponse = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId]
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    const video = videoResponse.data.items[0];
    const snippet = video.snippet!;
    const statistics = video.statistics!;
    const contentDetails = video.contentDetails!;

    console.log(`Video found: ${snippet.title}`);
    console.log(`Fetching up to ${maxComments} comments...`);

    // Fetch comments
    const comments: any[] = [];
    let pageToken: string | undefined = undefined;
    const limit = Math.min(maxComments, 2000);

    while (comments.length < limit) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const commentsResponse: any = await youtube.commentThreads.list({
          key: apiKey,
          part: ['snippet'],
          videoId: videoId,
          maxResults: Math.min(100, limit - comments.length),
          pageToken: pageToken,
          order: 'relevance', // Get most relevant comments first
          textFormat: 'plainText'
        });

        if (!commentsResponse.data.items || commentsResponse.data.items.length === 0) {
          break;
        }

        const fetchedComments = commentsResponse.data.items.map((item: any) => {
          const comment = item.snippet!.topLevelComment!.snippet!;
          return {
            text: comment.textDisplay || '',
            author: comment.authorDisplayName || 'Anonymous',
            likes: comment.likeCount || 0,
            replies: item.snippet!.totalReplyCount || 0,
            publishedAt: comment.publishedAt || new Date().toISOString()
          };
        });

        comments.push(...fetchedComments);

        // Check if there are more pages
        pageToken = commentsResponse.data.nextPageToken;
        if (!pageToken) {
          break;
        }

        console.log(`Fetched ${comments.length} comments so far...`);

      } catch (commentError: any) {
        // Comments might be disabled for the video
        if (commentError.code === 403) {
          console.log('Comments are disabled for this video');
          break;
        }
        throw commentError;
      }
    }

    console.log(`Total comments fetched: ${comments.length}`);

    return NextResponse.json({
      success: true,
      data: {
        videoId: videoId,
        videoTitle: snippet.title || 'Unknown Title',
        videoDescription: snippet.description || '',
        channelName: snippet.channelTitle || 'Unknown Channel',
        channelUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
        viewCount: parseInt(statistics.viewCount || '0'),
        likeCount: parseInt(statistics.likeCount || '0'),
        commentCount: parseInt(statistics.commentCount || '0'),
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        duration: contentDetails.duration || 'PT0S',
        comments: comments
      }
    });

  } catch (error: any) {
    console.error('YouTube API error:', error);

    // Handle quota exceeded error
    if (error.code === 403 && error.message?.includes('quota')) {
      return NextResponse.json(
        { success: false, error: 'YouTube API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
