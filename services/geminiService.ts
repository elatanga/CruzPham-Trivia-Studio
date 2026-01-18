
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Clue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleGeminiError = (error: any): never => {
  console.error("Gemini API Error:", error);
  let message = "AI Service Unavailable";
  
  const errString = error.toString().toLowerCase();
  const errMsg = error.message?.toLowerCase() || "";

  if (errString.includes("429") || errMsg.includes("quota")) {
    message = "AI Quota Exceeded - Please wait";
  } else if (errString.includes("503") || errMsg.includes("overloaded")) {
    message = "AI Service Overloaded - Try again";
  } else if (errString.includes("api key") || errMsg.includes("api key")) {
    message = "Invalid API Key Configuration";
  } else if (errMsg.includes("candidate")) {
    message = "AI Content Policy Filter Triggered";
  } else if (error.message) {
      // Return the raw message if it's not one of the above, but truncated for UI safety
      message = error.message.length > 50 ? `${error.message.substring(0, 50)}...` : error.message;
  }
  
  throw new Error(message);
};

export const generateTriviaBoard = async (topic: string): Promise<Category[]> => {
  const prompt = `You are a professional trivia producer for high-stakes luxury TV game shows.
    Generate a comprehensive Jeopardy-style trivia board for the topic: "${topic}". 
    Create exactly 5 unique categories. 
    Each category must have exactly 5 questions ranging from 100 to 500 points. 
    Questions must be clever, accurate, and categorized by increasing difficulty.
    Make the category titles punchy and thematic.`;

  try {
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

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    try {
      const data = JSON.parse(response.text.trim());
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
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, response.text);
      throw new Error("AI generated malformed data structure");
    }
  } catch (err) {
    // If it's our custom error, rethrow it
    if (err instanceof Error && (err.message === "AI generated malformed data structure" || err.message === "Empty response from AI")) {
      throw err;
    }
    // Otherwise normalize the API error
    handleGeminiError(err);
  }
};

/**
 * Generates a thematic image for a specific clue to add "luxury" visual flavor.
 */
export const generateClueVisual = async (prompt: string): Promise<string> => {
  try {
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, professional game show graphic representing: ${prompt}. Cinematic lighting, 4k, gold and black theme.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Visual generation returned no data");
  } catch (err) {
    if (err instanceof Error && err.message === "Visual generation returned no data") {
      throw err;
    }
    handleGeminiError(err);
  }
};
