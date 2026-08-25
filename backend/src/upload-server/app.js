import express from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "../config/cors.js";

const app = express();

app.use(express.json())
app.use(cookieParser());
app.use(corsMiddleware);
app.options("*", corsMiddleware);

app.get("/health", (req, res) => res.json({ ok: true, server: "upload" }));

export default app;
