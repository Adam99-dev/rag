import express from "express";
import {
  uploadDocument,
  fetchAllDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/docController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  upload.single("document"),
  uploadDocument
);

router.get(
  "/",
  requireAuth,
  fetchAllDocuments
);

router.get(
  "/:id",
  requireAuth,
  getDocument
);

router.delete(
  "/:id",
  requireAuth,
  deleteDocument
);

export default router;