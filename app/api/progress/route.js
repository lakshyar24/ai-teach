import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { roadmapId, topicId, completed } = body;

    if (!roadmapId || !topicId) {
      return NextResponse.json(
        { error: 'Roadmap ID and Topic ID are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Upsert progress
    await db.collection('progress').updateOne(
      { roadmap_id: roadmapId, topic_id: topicId },
      { 
        $set: { 
          completed: completed,
          updated_at: new Date()
        },
        $setOnInsert: {
          _id: uuidv4(),
          roadmap_id: roadmapId,
          topic_id: topicId,
          created_at: new Date()
        }
      },
      { upsert: true }
    );

    console.log(`Progress updated: Topic ${topicId} marked as ${completed ? 'completed' : 'incomplete'}`);

    return NextResponse.json({
      success: true,
      completed
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roadmapId = searchParams.get('roadmapId');

    if (!roadmapId) {
      return NextResponse.json(
        { error: 'Roadmap ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const progress = await db.collection('progress')
      .find({ roadmap_id: roadmapId })
      .toArray();

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}