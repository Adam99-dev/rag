import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/userRoutes.js";
import docRoutes from "./routes/docRoutes.js"
import chatRoutes from "./routes/chatRoutes.js"


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use("/api/auth", authRoutes);
app.use("/api/document", docRoutes);
app.use("/api/chat", chatRoutes);


app.get("/health", (req, res) => res.json({ ok: true, server: "user" }));


export default app;
