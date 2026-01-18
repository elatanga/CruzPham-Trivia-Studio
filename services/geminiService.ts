
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Service Shell - Logic removed for fresh start
export const generateTriviaBoard = async (topic: string) => {
  throw new Error("Service Not Implemented");
};

export const generateClueVisual = async (prompt: string) => {
  throw new Error("Service Not Implemented");
};
