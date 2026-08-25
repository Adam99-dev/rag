import cors from "cors";

const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function parseOrigins(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = new Set([
  ...DEFAULT_LOCAL_ORIGINS,
  ...parseOrigins(process.env.CORS_ORIGIN),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CLIENT_ORIGIN),
]);

const localOriginPattern =
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || localOriginPattern.test(origin) || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "Cache-Control",
    "Pragma",
  ],
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);
