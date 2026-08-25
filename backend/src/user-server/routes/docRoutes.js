import express from "express";
import multer from "multer";
import { uploadDocument } from "../controllers/docController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import {upload} from "../middleware/upload.js"

const router = express.Router();

router.post(
  "/",
  requireAuth,
  upload.single("document"),
  uploadDocument
);

export default router;