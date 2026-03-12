import express from "express";
import { updateOrderStatus } from "../controllers/delivery.controller.js";

const router = express.Router();

router.post("/update-status", updateOrderStatus);

export default router;