import { Queue } from "bullmq";
import client from "../config/redis.js";

export const statusQueue = new Queue("document-status", {
  connection: client,
});

