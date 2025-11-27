import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SaveHistoryRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: SaveHistoryRequest = await request.json();

    // Validate required fields
    if (!body.videoId || !body.videoTitle || !body.analysis) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'analyses'), {
      videoId: body.videoId,
      videoTitle: body.videoTitle,
      videoChannel: body.videoChannel || 'Unknown Channel',
      videoUrl: body.videoUrl,
      modelUsed: body.modelUsed,
      totalComments: body.totalComments || 0,
      analysis: body.analysis,
      tokensUsed: body.tokensUsed || null,
      createdAt: serverTimestamp()
    });

    console.log(`Analysis saved with ID: ${docRef.id}`);

    return NextResponse.json({
      success: true,
      message: 'Analysis saved successfully',
      docId: docRef.id
    });

  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
