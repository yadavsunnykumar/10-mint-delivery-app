import express from "express";
import {
  getAllProductsAdmin,
  updateProductStock,
  createProduct,
  getAllOrdersAdmin,
  updateOrderStatus,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// All admin routes require a valid X-Admin-Key header
router.use(requireAdmin);

router.get("/products", getAllProductsAdmin);
router.post("/products", createProduct);
router.put("/products/:id/stock", updateProductStock);
router.get("/orders", getAllOrdersAdmin);
router.put("/orders/:orderId/status", updateOrderStatus);

export default router;
