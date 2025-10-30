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
      "video_suggestions": ["YouTube search query 1", "YouTube search query 2"],
      "practice_questions": [
        {"title": "Question name", "difficulty": "Easy/Medium/Hard", "platform": "LeetCode", "url": "https://leetcode.com/problems/..."},
        {"title": "Question name 2", "difficulty": "Medium", "platform": "LeetCode", "url": "https://leetcode.com/problems/..."}
      ],
      "order": 1
    }
  ]
}

IMPORTANT:
- Create 8-15 topics that fit within the available time
- For each topic, suggest 2-3 YouTube search queries for finding tutorial videos
- For each topic, suggest 2-5 relevant practice questions from LeetCode with actual problem URLs
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
      max_tokens: 6000
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

export async function visualizeCode({ code, language }) {
  const systemMessage = `You are an expert programming tutor who explains code execution step-by-step.
You must return ONLY valid JSON without any markdown formatting, code blocks, or additional text.`;

  const userMessage = `Analyze this ${language} code and explain its execution step-by-step:

\`\`\`${language}
${code}
\`\`\`

Return ONLY a JSON object with this exact structure:
{
  "steps": [
    {
      "step": 1,
      "line": 1,
      "description": "What happens on this line",
      "variables": {"varName": "value"},
      "highlight": true
    }
  ],
  "summary": "Brief explanation of what this code does"
}

IMPORTANT:
- Explain EVERY line of code execution
- Track variable values as they change
- Be clear and beginner-friendly
- Return ONLY the JSON object, no other text`;

  try {
    const response = await client.chat.completions.create({
      model: PERPLEXITY_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.5,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    let jsonContent = content;
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const visualization = JSON.parse(jsonContent);
    return visualization;
  } catch (error) {
    console.error('Error visualizing code:', error);
    throw new Error('Failed to visualize code: ' + error.message);
  }
}

export default { generateRoadmap, visualizeCode };