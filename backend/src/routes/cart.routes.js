import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addToCart);
router.put("/item/:product_id", requireAuth, updateCartItem);
router.delete("/item/:product_id", requireAuth, removeFromCart);
router.delete("/clear", requireAuth, clearCart);

export default router;
