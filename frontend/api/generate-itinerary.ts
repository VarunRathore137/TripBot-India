import { OpenAI } from 'openai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { destination, duration, budget, interests = [], groupSize } = request.body;

    const prompt = `Create a detailed ${duration}-day travel itinerary for ${destination} with the following criteria:
    - Budget: ${budget}
    - Group Size: ${groupSize} people
    - Interests: ${interests.join(', ')}
    - Include specific places, timing, and approximate costs
    - Format as a structured day-by-day plan
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const itineraryText = completion.choices[0].message.content;

    // Process the text into structured format
    const days = itineraryText.split(/Day \d+:/g).filter(Boolean);
    
    const structuredItinerary = {
      destination,
      duration,
      totalBudget: budget,
      groupSize,
      days: days.map((day, index) => ({
        dayNumber: index + 1,
        activities: day
          .split('\n')
          .filter(line => line.trim())
          .map(activity => ({
            time: activity.match(/(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)/)?.[1] || '',
            description: activity.trim(),
          })),
      })),
    };

    return response.status(200).json({
      status: 'success',
      data: structuredItinerary,
    });

  } catch (error) {
    console.error('Itinerary generation error:', error);
    return response.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to generate itinerary',
    });
  }
}