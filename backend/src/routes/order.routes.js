import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderStatus,
  getOrderTracking,
  estimateEta,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/estimate-eta", estimateEta);
router.post("/create", requireAuth, createOrder);
router.get("/user/:userId", requireAuth, getUserOrders);
router.get("/status/:orderId", requireAuth, getOrderStatus);
router.get("/tracking/:orderId", requireAuth, getOrderTracking);

export default router;
