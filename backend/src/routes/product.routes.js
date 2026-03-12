import express from "express";
import {
  getAllProducts,
  getProductById,
  getCategories,
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
