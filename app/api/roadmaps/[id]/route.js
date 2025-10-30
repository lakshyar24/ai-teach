import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = await getDb();

    // Get roadmap
    const roadmap = await db.collection('roadmaps').findOne({ _id: id });

    if (!roadmap) {
      return NextResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    // Get topics
    const topics = await db.collection('topics')
      .find({ roadmap_id: id })
      .sort({ order_index: 1 })
      .toArray();

    return NextResponse.json({
      roadmap,
      topics
    });

  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}