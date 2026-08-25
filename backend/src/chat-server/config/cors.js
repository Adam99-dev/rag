import cors from "cors";

const origins = ["http://localhost:5173", ...String(process.env.FRONTEND_URL || "").split(",")]
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => callback(null, !origin || origins.includes(origin)),
  credentials: true,
});
