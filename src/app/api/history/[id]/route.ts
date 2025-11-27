import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    const docRef = doc(db, 'analyses', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    return NextResponse.json({
      success: true,
      id: docSnap.id,
      videoId: data.videoId,
      videoTitle: data.videoTitle,
      videoChannel: data.videoChannel,
      videoUrl: data.videoUrl,
      modelUsed: data.modelUsed,
      totalComments: data.totalComments,
      analysis: data.analysis,
      tokensUsed: data.tokensUsed,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
