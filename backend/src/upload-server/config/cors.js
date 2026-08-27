import cors from "cors";

export const corsMiddleware = cors({
  origin: "https://doc-u-mind.vercel.app",
  credentials: true,
});