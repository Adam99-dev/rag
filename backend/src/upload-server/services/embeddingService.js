import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { splitDocuments } from "./chunkingService.js";
import { loadPDF } from "./pdfService.js";
import { statusQueue } from "../queue/statusQueue.js";

// Use the correct model name
const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
const EMBEDDING_DIMENSIONS = 768;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function toVectors(textChunks, embeddings, documentId) {
  return textChunks
    .map((text, index) => ({
      id: `${documentId}-${index}`,
      values: embeddings[index],
      metadata: { text, documentId },
    }))
    .filter((vector) => vector.values?.length === EMBEDDING_DIMENSIONS);
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

async function embedWithRetry(text, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: [{ text }], // Wrap text in an object
        config: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });

      // Check different possible response structures
      if (response.embeddings && response.embeddings[0]) {
        return response.embeddings[0].values;
      } else if (response.embedding) {
        return response.embedding.values;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.log(`Attempt ${attempt}/${retries} failed: ${error.message}`);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * attempt),
      );
    }
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
    const failedChunks = [];

    for (let i = 0; i < textChunks.length; i++) {
      try {
        const embedding = await embedWithRetry(textChunks[i]);
        embeddings.push(embedding);
        printProgress(i + 1, textChunks.length);

        // Rate limiting delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.log(`\nFailed to embed chunk ${i + 1} after all retries`);
        failedChunks.push(i);
        // Push null to maintain index alignment
        embeddings.push(null);
      }
    }

    // Filter out failed chunks
    const successfulVectors = toVectors(
      textChunks.filter((_, index) => !failedChunks.includes(index)),
      embeddings.filter((embedding) => embedding !== null),
      documentId,
    );

    console.log(
      `\nSuccessfully embedded ${successfulVectors.length}/${textChunks.length} chunks`,
    );

    return successfulVectors;
  } catch (error) {
    console.error("Error in generateEmbeddings:", error);
    throw error;
  }
}
