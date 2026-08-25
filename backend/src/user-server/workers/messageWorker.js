import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import client from "../config/redis.js";
import { prisma } from "../config/prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.status(200).send("Message Worker is running");
});

app.use(cors({
    origin: [
        'http://localhost:5173'
    ]
}));

app.listen(PORT, () => {
  console.log(`Message Worker HTTP server running on port ${PORT}`);
});

console.log("Message Worker Started");

const worker = new Worker(
  "message-save",
  async (job) => {
    const { chatId, role, content, sources } = job.data;

    await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        sources: sources || null,
      },
    });

    console.log(`Message saved for chat ${chatId}`);
  },
  {
    connection: client,
    removeOnComplete: { count: 0 },
  }
);

worker.on("completed", (job) => {
  console.log(`Message Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Message Job ${job?.id} failed:`, err);
});