import express from "express";
import {
  getProfile,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);

export default router;
