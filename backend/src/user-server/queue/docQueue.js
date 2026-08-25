import { Queue } from "bullmq";
import client from "../config/redis.js";

export const documentQueue = new Queue("document-processing", {
  connection: client,
});