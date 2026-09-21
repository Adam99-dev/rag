import express from "express";
import { getPrice, addNewCard, createCharges } from "../controllers/paymentController.js"
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/price", getPrice);

router.post(
  "/add-card",
  requireAuth,
  addNewCard
);

router.post(
  "/create-charges",
  requireAuth,
  createCharges
);

export default router;