import express from "express";
import { getChat } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get(
  "/:id",
  requireAuth,
  getChat
);

export default router;