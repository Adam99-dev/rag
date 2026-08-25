import "dotenv/config";
import { Worker } from "bullmq";
import client from "../config/redis.js";
import { processDocument } from "../services/documentProcessor.js";
import { statusQueue } from "../queue/statusQueue.js";


console.log("Document Processing Worker Started");

const worker = new Worker(
  "document-processing",
  async (job) => {
    const { documentId, fileUrl } = job.data;

    await processDocument(documentId, fileUrl);

    await statusQueue.add("status", {
      documentId,
      status: "COMPLETED",
    });
  },
  {
    connection: client,
    removeOnComplete: { count: 0 },
  }
);

worker.on("completed", (job) => {
  console.log(`Document Processing Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Document Processing Job ${job?.id} failed:`, err);
});