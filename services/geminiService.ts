import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generatePTResponse = async (
  history: ChatMessage[], 
  trainerName: string, 
  lastUserMessage: string
): Promise<string> => {
  const client = getAI();
  if (!client) {
    console.warn("API Key missing, returning mock response");
    return "Hej! I am currently offline, but I will get back to you regarding your training shortly.";
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Construct a simple history string or use structure
    const context = `You are a helpful and motivating Danish Personal Trainer named ${trainerName}. 
    Respond to the client's last message. Keep it short, encouraging, and professional. 
    You can speak English or Danish depending on the user's language.`;

    const response = await client.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: `${context}\n\nClient says: ${lastUserMessage}` }] }
      ]
    });

    return response.text || "Keep pushing! I'll check your form soon.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI Coach.";
  }
};