import express from "express";
import Warehouse from "../models/warehouse.model.js";

const router = express.Router();

// GET /warehouses — list all active warehouses (used by frontend to pick warehouse for order)
router.get("/", async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ is_active: true }).select(
      "warehouse_id name location address city",
    );
    res.json({ success: true, warehouses });
  } catch (err) {
    console.error("Warehouses fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

export default router;
