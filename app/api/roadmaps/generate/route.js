import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query, initDatabase } from '@/lib/db';
import { generateRoadmap } from '@/lib/perplexity';

export async function POST(request) {
  try {
    // Initialize database if not already done
    await initDatabase();

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
    const roadmapId = uuidv4();
    const insertRoadmapQuery = `
      INSERT INTO user_roadmaps (id, title, goal, total_days, hours_per_day, skill_level, focus_areas, is_custom)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `;

    const roadmapResult = await query(insertRoadmapQuery, [
      roadmapId,
      roadmapData.title,
      goal,
      parseInt(totalDays),
      parseFloat(hoursPerDay),
      skillLevel,
      focusAreas || []
    ]);

    console.log('Roadmap saved to database');

    // Save topics
    const topics = roadmapData.topics || [];
    for (const topic of topics) {
      const topicId = uuidv4();
      const insertTopicQuery = `
        INSERT INTO roadmap_topics (id, roadmap_id, title, description, order_index, estimated_hours, learning_objectives)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await query(insertTopicQuery, [
        topicId,
        roadmapId,
        topic.title,
        topic.description,
        topic.order,
        topic.estimated_hours,
        topic.learning_objectives || []
      ]);
    }

    console.log(`${topics.length} topics saved to database`);

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