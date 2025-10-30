import { NextResponse } from 'next/server';
import { visualizeCode } from '@/lib/perplexity';

export async function POST(request) {
  try {
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    console.log('Visualizing code with AI...');
    
    const visualization = await visualizeCode({ code, language });

    console.log('Code visualization generated successfully');

    return NextResponse.json({
      success: true,
      visualization
    });

  } catch (error) {
    console.error('Error in code visualization:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to visualize code' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to visualize code' });
}