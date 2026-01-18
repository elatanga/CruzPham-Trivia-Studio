
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Clue, CategorySchema } from "../types";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for raw Gemini output
const GeminiBoardSchema = z.array(z.object({
  id: z.string(),
  title: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    points: z.number(),
    prompt: z.string(),
    answer: z.string()
  }))
}));

export const generateTriviaBoard = async (topic: string): Promise<Category[]> => {
  const prompt = `You are a professional trivia producer for high-stakes luxury TV game shows.
    Generate a comprehensive Jeopardy-style trivia board for the topic: "${topic}". 
    Create exactly 5 unique categories. 
    Each category must have exactly 5 questions ranging from 100 to 500 points. 
    Questions must be clever, accurate, and categorized by increasing difficulty.
    Make the category titles punchy and thematic.
    Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  points: { type: Type.NUMBER },
                  prompt: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["id", "points", "prompt", "answer"]
              }
            }
          },
          required: ["id", "title", "questions"]
        }
      }
    }
  });

  try {
    const text = response.text || '';
    const rawData = JSON.parse(text.trim());
    
    // Validate the raw output
    const validatedData = GeminiBoardSchema.parse(rawData);

    return validatedData.map((cat: any, idx: number) => {
      const categoryId = cat.id || `cat-${idx}-${Date.now()}`;
      return {
        id: categoryId,
        title: cat.title,
        questions: cat.questions.map((q: any, qIdx: number) => ({
          id: q.id || `q-${idx}-${qIdx}-${Date.now()}`,
          categoryId: categoryId,
          points: q.points,
          prompt: q.prompt,
          answer: q.answer,
          status: 'available'
        }))
      };
    }) as Category[];
  } catch (err) {
    console.error("Gemini Validation Error:", err);
    throw new Error("AI reconstruction failed integrity checks. Please refine the topic.");
  }
};

export const generateClueVisual = async (prompt: string): Promise<string> => {
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A professional game show graphic representing: ${prompt}. Cinematic lighting, gold and black theme, 4k.` }]
    },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    }
  });

  for (const part of imageResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Visual synthesis failed.");
};
