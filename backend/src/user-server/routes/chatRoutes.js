import express from "express";
import { getChat } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get(
  "/:id",
  requireAuth,
  getChat
);

router.post("/", requireAuth, async (req, res) => {
  try {
    const chatUrl = process.env.CHAT_SERVER_URL || `http://localhost:${process.env.CHAT_SERVER_PORT || 3002}`;
    const response = await fetch(`${chatUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${req.cookies.token}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ message: "Chat service unavailable" });
  }
});

export default router;
