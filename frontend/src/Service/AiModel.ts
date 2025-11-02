import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

const generationConfig = {
  maxOutputTokens: 2048,
  temperature: 0.9,
  topP: 1,
  topK: 1,
};

export const model = genAI.getGenerativeModel({ model: "gemini-pro", generationConfig });

export const startChat = async () => {
  return model.startChat({
    history: [],
    generationConfig,
  });
};

interface ItineraryFormData {
  destination: string;
  duration: string;
  preferences?: string[];
}

export const generateItinerary = async (formData: ItineraryFormData) => {
  try {
    const chat = await startChat();
    const prompt = `Create a detailed ${formData.duration}-day itinerary for ${formData.destination}.
      ${formData.preferences?.length ? `Include activities related to: ${formData.preferences.join(', ')}` : ''}
      Format the response as a JSON object with the following structure:
      {
        "destination": string,
        "duration": number,
        "days": [
          {
            "dayNumber": number,
            "activities": [
              {
                "time": string,
                "description": string,
                "location": string
              }
            ]
          }
        ]
      }`;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Failed to parse itinerary data');
    }
  } catch (error) {
    throw new Error('Failed to generate itinerary');
  }
};