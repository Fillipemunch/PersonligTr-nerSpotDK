import { GoogleGenAI } from "@google/genai";
import { ChatMessage, User } from '../types';

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

export const generateAIPlan = async (clientData: User): Promise<{
  workoutTitle: string;
  workoutDay: string;
  exercises: string;
  dietTitle: string;
  dietFocus: string;
  meals: string;
} | null> => {
  const client = getAI();
  if (!client) return null;

  try {
    const model = 'gemini-2.5-flash';
    const health = clientData.healthData || {};
    
    const prompt = `
      Create a personalized workout and diet plan for a client with the following profile:
      - Weight: ${health.weight || 'Unknown'} kg
      - Height: ${health.height || 'Unknown'} cm
      - Fitness Level: ${health.fitnessLevel || 'Beginner'}
      - Goals: ${health.goals || 'General Fitness'}
      - Medical History: ${health.medicalHistory || 'None'}

      Output strictly in JSON format with these keys:
      {
        "workoutTitle": "Catchy title for the workout",
        "workoutDay": "Suggested frequency (e.g. Mon/Wed/Fri)",
        "exercises": "List of 5-6 exercises with sets/reps, separated by newline characters (\\n)",
        "dietTitle": "Catchy title for the diet",
        "dietFocus": "Main nutritional focus (e.g. High Protein)",
        "meals": "List of Breakfast, Lunch, Dinner ideas with calories, separated by newline characters (\\n)"
      }
    `;

    const response = await client.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini Plan Gen Error:", error);
    return null;
  }
};