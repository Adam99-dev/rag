import express, { Router } from "express";
import { signupController, loginController, logoutController, meController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);


export default router;