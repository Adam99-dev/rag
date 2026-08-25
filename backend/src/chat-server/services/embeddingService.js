import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateQueryEmbedding(query) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: query,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  return response.embeddings[0].values;
}
