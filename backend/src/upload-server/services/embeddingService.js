import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { splitDocuments } from "./chunkingService.js";
import { loadPDF } from "./pdfService.js";
import { statusQueue } from "../queue/statusQueue.js";

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
const EMBEDDING_DIMENSIONS = 768;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function toVectors(textChunks, embeddings, documentId) {
  return textChunks.map((text, index) => ({
    id: `${documentId}-${index}`,
    values: embeddings[index],
    metadata: { text, documentId },
  })).filter((vector) => vector.values?.length === EMBEDDING_DIMENSIONS);
}

function printProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
  
  process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total})`);
  
  if (current === total) {
    process.stdout.write("\n");
  }
}

export async function generateEmbeddings(pdfBuffer, documentId) {
  try {
    const docs = await loadPDF(pdfBuffer);
    await statusQueue.add("status", {
  documentId,
  status: "CHUNKING",
});
    const textChunks = await splitDocuments(docs);
    

    if (!textChunks.length) {
      return [];
    }

    
        await statusQueue.add("status", {
      documentId,
      status: "EMBEDDING",
    });

    const embeddings = [];

    for (let i = 0; i < textChunks.length; i++) {
      try {
        const response = await ai.models.embedContent({
          model: EMBEDDING_MODEL,
          contents: textChunks[i],
          config: {
            outputDimensionality: EMBEDDING_DIMENSIONS,
          },
        });

        embeddings.push(response.embeddings[0].values);
        
        printProgress(i + 1, textChunks.length);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`\nError embedding chunk ${i + 1}`);
      }
    }

    return toVectors(textChunks, embeddings, documentId);
  } catch (error) {
    console.error("Error in generateEmbeddings:", error);
    throw error;
  }
}