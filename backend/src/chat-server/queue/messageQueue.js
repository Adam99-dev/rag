import { Queue } from "bullmq";
import client from "../config/redis.js";

export const messageQueue = new Queue("message-save", {
  connection: client,
});



