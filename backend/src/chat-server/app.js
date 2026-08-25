import express from "express";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chatRoutes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { corsMiddleware } from "../config/cors.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);
app.use(corsMiddleware);

app.get("/health", (req, res) => res.json({ ok: true, server: "chat" }));
app.use("/api/chat", requireAuth, chatRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message || "Server error" });
});

export default app;
