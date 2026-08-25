import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ],
  credentials: true,
});