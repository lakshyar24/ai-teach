import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get roadmap
    const roadmapQuery = 'SELECT * FROM user_roadmaps WHERE id = $1';
    const roadmapResult = await query(roadmapQuery, [id]);

    if (roadmapResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      );
    }

    const roadmap = roadmapResult.rows[0];

    // Get topics
    const topicsQuery = `
      SELECT * FROM roadmap_topics 
      WHERE roadmap_id = $1 
      ORDER BY order_index ASC
    `;
    const topicsResult = await query(topicsQuery, [id]);

    return NextResponse.json({
      roadmap,
      topics: topicsResult.rows
    });

  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    );
  }
}