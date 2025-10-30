import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { generateRoadmap } from '@/lib/perplexity';

export async function POST(request) {
  try {
    const body = await request.json();
    const { goal, totalDays, hoursPerDay, skillLevel, focusAreas } = body;

    // Validate input
    if (!goal || !totalDays || !hoursPerDay || !skillLevel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Generating roadmap with Perplexity AI...');
    
    // Generate roadmap using Perplexity API
    const roadmapData = await generateRoadmap({
      goal,
      totalDays: parseInt(totalDays),
      hoursPerDay: parseFloat(hoursPerDay),
      skillLevel,
      focusAreas: focusAreas || []
    });

    console.log('Roadmap generated successfully:', roadmapData.title);

    // Save roadmap to database
    const db = await getDb();
    const roadmapId = uuidv4();
    
    const roadmap = {
      _id: roadmapId,
      title: roadmapData.title,
      goal,
      total_days: parseInt(totalDays),
      hours_per_day: parseFloat(hoursPerDay),
      skill_level: skillLevel,
      focus_areas: focusAreas || [],
      is_custom: true,
      created_at: new Date()
    };

    await db.collection('roadmaps').insertOne(roadmap);
    console.log('Roadmap saved to database');

    // Save topics
    const topics = roadmapData.topics || [];
    const topicsToInsert = topics.map(topic => ({
      _id: uuidv4(),
      roadmap_id: roadmapId,
      title: topic.title,
      description: topic.description,
      order_index: topic.order,
      estimated_hours: topic.estimated_hours,
      learning_objectives: topic.learning_objectives || [],
      created_at: new Date()
    }));

    if (topicsToInsert.length > 0) {
      await db.collection('topics').insertMany(topicsToInsert);
      console.log(`${topics.length} topics saved to database`);
    }

    return NextResponse.json({
      success: true,
      roadmapId: roadmapId,
      title: roadmapData.title,
      topicsCount: topics.length
    });

  } catch (error) {
    console.error('Error in roadmap generation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to generate a roadmap' });
}