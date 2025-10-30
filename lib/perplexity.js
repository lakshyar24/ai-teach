import { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

const PERPLEXITY_MODEL = 'sonar';

export async function generateRoadmap({ goal, totalDays, hoursPerDay, skillLevel, focusAreas }) {
  const systemMessage = `You are an expert learning path designer specializing in technology education. 
Create structured, achievable learning roadmaps with realistic time estimates. 
You must return ONLY valid JSON without any markdown formatting, code blocks, or additional text.`;

  const userMessage = `Create a comprehensive learning roadmap for the following:

Goal: ${goal}
Available time: ${totalDays} days at ${hoursPerDay} hours per day (Total: ${totalDays * hoursPerDay} hours)
Current skill level: ${skillLevel}
Focus areas: ${focusAreas.join(', ')}

Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "title": "Brief roadmap title (max 60 chars)",
  "topics": [
    {
      "title": "Topic name",
      "description": "Detailed description of what to learn",
      "estimated_hours": 8,
      "learning_objectives": ["objective 1", "objective 2", "objective 3"],
      "order": 1
    }
  ]
}

IMPORTANT:
- Create 8-15 topics that fit within the available time
- Ensure topics are ordered logically with dependencies
- Each topic should have 3-5 learning objectives
- Total estimated hours should not exceed ${totalDays * hoursPerDay} hours
- Adapt complexity to the ${skillLevel} skill level
- Return ONLY the JSON object, no other text`;

  try {
    const response = await client.chat.completions.create({
      model: PERPLEXITY_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonContent = content;
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const roadmapData = JSON.parse(jsonContent);
    return roadmapData;
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate roadmap: ' + error.message);
  }
}

export default { generateRoadmap };