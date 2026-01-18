
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Clue, CategorySchema, TemplateSchema } from "../types";
import { z } from "zod";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Rate limiting logic: Simple client-side throttle to protect quotas
 */
let lastCall = 0;
const THROTTLE_MS = 2000;

const checkThrottle = () => {
  const now = Date.now();
  if (now - lastCall < THROTTLE_MS) throw new Error("Director is busy. Wait a moment.");
  lastCall = now;
};

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
  checkThrottle();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a high-stakes luxury trivia board for: "${topic}". 
      5 categories, 5 questions each (100-500 points). 
      Return structured JSON.`,
    config: {
      systemInstruction: "You are EL CRUZPHAM, the world's most elite trivia director. Your questions are witty, accurate, and challenging. Your formatting is flawless JSON.",
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
    const rawData = JSON.parse(response.text || '[]');
    const validatedData = GeminiBoardSchema.parse(rawData);

    return validatedData.map((cat, idx) => ({
      id: cat.id || `c-${idx}-${Date.now()}`,
      title: cat.title,
      questions: cat.questions.map((q, qIdx) => ({
        id: q.id || `q-${idx}-${qIdx}-${Date.now()}`,
        categoryId: cat.id || '',
        points: q.points,
        prompt: q.prompt,
        answer: q.answer,
        status: 'available'
      }))
    })) as any;
  } catch (err) {
    console.error("Board Integrity Failure:", err);
    throw new Error("Gemini produced malformed data. Try a different topic.");
  }
};

export const generateClueVisual = async (prompt: string): Promise<string> => {
  checkThrottle();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A cinematic 4K game show graphic for: ${prompt}. Luxury black and gold aesthetics, bokeh background.` }]
    },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Visual Synthesis failed.");
};
