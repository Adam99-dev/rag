import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import client from "../config/redis.js";
import { prisma } from "../config/prisma.js";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("Status Worker is running");
});

app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));

app.listen(PORT, () => {
  console.log(`Status Worker HTTP server running on port ${PORT}`);
});

console.log("Status Worker Started");

const worker = new Worker(
  "document-status",
  async (job) => {
    const { documentId, status } = job.data;

    const document = await prisma.document.update({
      where: { id: documentId },
      data: { status },
    });

    if (status === "COMPLETED") {
      await prisma.chat.upsert({
        where: { documentId },
        update: {},
        create: {
          userId: document.userId,
          documentId,
        },
      });
    }
  },
  {
    connection: client,
    removeOnComplete: { count: 0 },
  }
);

worker.on("completed", (job) => {
  console.log(`Status Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Status Job ${job?.id} failed:`, err);
});