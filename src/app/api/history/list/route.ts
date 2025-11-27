import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitCount = parseInt(searchParams.get('limit') || '50');

    // Query Firestore
    const q = query(
      collection(db, 'analyses'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const analyses = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        videoId: data.videoId,
        videoTitle: data.videoTitle,
        videoChannel: data.videoChannel,
        modelUsed: data.modelUsed,
        totalComments: data.totalComments,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      analyses
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
