import { pineconeIndex } from "../config/pinecone.js";
import { generateEmbeddings } from "./embeddingService.js";
import { statusQueue } from "../queue/statusQueue.js";

const UPSERT_BATCH_SIZE = Number(
  process.env.PINECONE_UPSERT_BATCH_SIZE || 100
);

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export async function indexToPinecone(pdfBuffer, documentId) {
  try {

    const vectors = await generateEmbeddings(pdfBuffer, documentId);

    if (!vectors.length) {
      throw new Error("No vectors generated.");
    }

    await statusQueue.add("status", {
      documentId,
      status: "INDEXING",
    });

    const batches = chunkArray(vectors, UPSERT_BATCH_SIZE);

    for (const batch of batches) {
      await pineconeIndex.upsert({ records: batch });
    }
    return { count: vectors.length };

  } catch (error) {
    await statusQueue.add("status", {
      documentId,
      status: "FAILED",
    });

    throw error;
  }
}