// app.js
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/userRoutes.js";
import docRoutes from "./routes/docRoutes.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/document", docRoutes);


export default app;
