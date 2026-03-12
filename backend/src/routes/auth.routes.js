import express from "express";
import {
  getProfile,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", requireAuth, getProfile);

export default router;
