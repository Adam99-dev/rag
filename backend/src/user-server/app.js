import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/userRoutes.js";
import docRoutes from "./routes/docRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"
import { corsMiddleware } from "./config/cors.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(corsMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/document", docRoutes);
app.use("/api/chat", chatRoutes);


app.get("/health", (req, res) => res.json({ ok: true, server: "user" }));


export default app;
