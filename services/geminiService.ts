
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Clue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTriviaBoard = async (topic: string): Promise<Category[]> => {
  const prompt = `You are a professional trivia producer for high-stakes luxury TV game shows.
    Generate a comprehensive Jeopardy-style trivia board for the topic: "${topic}". 
    Create exactly 5 unique categories. 
    Each category must have exactly 5 questions ranging from 100 to 500 points. 
    Questions must be clever, accurate, and categorized by increasing difficulty.
    Make the category titles punchy and thematic.`;

  // Fix: Upgraded to gemini-3-pro-preview for complex reasoning/structured output generation.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
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
                  answer: { type: Type.STRING },
                  status: { type: Type.STRING }
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
    const data = JSON.parse(text.trim());
    return data.map((cat: any, idx: number) => {
      const categoryId = cat.id || `cat-${idx}-${Date.now()}`;
      return {
        ...cat,
        id: categoryId,
        questions: cat.questions.map((q: any, qIdx: number) => ({
          ...q,
          id: q.id || `q-${idx}-${qIdx}-${Date.now()}`,
          categoryId: categoryId,
          status: 'available'
        }))
      };
    });
  } catch (err) {
    console.error("Failed to parse Gemini response", err);
    throw new Error("Invalid board data generated.");
  }
};

/**
 * Generates a thematic image for a specific clue to add "luxury" visual flavor.
 */
export const generateClueVisual = async (prompt: string): Promise<string> => {
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-quality, professional game show graphic representing: ${prompt}. Cinematic lighting, 4k, gold and black theme.` }]
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
  throw new Error("Image generation failed");
};
