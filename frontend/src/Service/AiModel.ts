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