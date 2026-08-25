import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import client from "../config/redis.js";
import { processDocument } from "../services/documentProcessor.js";
import { statusQueue } from "../queue/statusQueue.js";
import { corsMiddleware } from "../config/cors.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Document Worker is running");
});

app.use(corsMiddleware);

app.listen(3001, () => {
  console.log(`Document Worker HTTP server running on port 3001`);
});

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
