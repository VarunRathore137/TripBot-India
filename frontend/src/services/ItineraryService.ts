import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Activity {
  time: string;
  description: string;
  emoji: string;
  type: 'culture' | 'adventure' | 'food' | 'relaxation' | 'sightseeing';
}

interface DayPlan {
  dayNumber: number;
  theme: string;
  themeEmoji: string;
  activities: Activity[];
}

interface GeneratedItinerary {
  destination: string;
  duration: number;
  days: DayPlan[];
}

export async function generateItinerary(
  destination: string,
  days: number,
  preferences: string[]
): Promise<GeneratedItinerary> {
  const prompt = `Create a detailed ${days}-day travel itinerary for ${destination}.
Preferences: ${preferences.join(', ')}

Format the response as a JSON object with this exact structure:
{
  "destination": "${destination}",
  "duration": ${days},
  "days": [
    {
      "dayNumber": number,
      "theme": "Theme of the day",
      "themeEmoji": "Single emoji representing the theme",
      "activities": [
        {
          "time": "HH:MM AM/PM",
          "description": "Activity description",
          "emoji": "Single emoji representing activity",
          "type": "culture|adventure|food|relaxation|sightseeing"
        }
      ]
    }
  ]
}

Ensure each day has:
- A clear theme (e.g., "Historical Exploration", "Local Culture", "Adventure Day")
- 4-6 activities with specific times
- Relevant emojis for theme and activities
- Mix of activity types throughout the day`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-json",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a travel planning assistant that creates detailed itineraries in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Itinerary generation error:', error);
    throw new Error('Failed to generate itinerary. Please try again.');
  }
}