import Order from "../models/order.model.js";
import Warehouse from "../models/warehouse.model.js";
import DeliveryPartner from "../models/deliveryPartner.model.js";
import axios from "axios";
import { findNearestRider } from "../utils/findNearestRider.js";

// Simple Haversine distance in km (no external dep needed)
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      warehouse_id,
      user_location,
      items,
      total_amount,
      ...orderData
    } = req.body;

    if (
      !warehouse_id ||
      !user_location ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res
        .status(400)
        .json({ error: "warehouse_id, user_location and items are required" });
    }

    // Prefer authenticated user identity when available.
    const resolvedUserId = req.user?.user_id || user_id;
    if (!resolvedUserId) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Try AI ETA prediction first, fallback to a sane default when AI is unavailable.
    const aiUrl = process.env.AI_URL || "http://localhost:8000";
    let etaMinutes = 10;

    try {
      const etaResp = await axios.post(`${aiUrl}/predict-eta`, {
        warehouse_id,
        user_location,
        items,
      });
      etaMinutes = etaResp.data.eta_minutes ?? 10;
    } catch {
      // Intentionally silent: fallback ETA keeps order flow available.
    }

    // Step 1: Find warehouse
    const warehouse = await Warehouse.findOne({ warehouse_id });
    if (!warehouse) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    // Step 2: Assign nearest rider
    const rider = await findNearestRider(warehouse.location);

    if (rider) {
      await DeliveryPartner.findByIdAndUpdate(rider._id, {
        is_available: false,
      });
    }

    // Step 3: Create the order with ETA and rider assignment
    const order_id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = await Order.create({
      order_id,
      user_id: resolvedUserId,
      warehouse_id,
      user_location,
      items,
      total_amount,
      payment_status: "pending",
      eta_minutes: etaMinutes,
      rider_id: rider?._id || null,
    });

    res.status(201).json({
      success: true,
      eta: etaMinutes,
      order: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// POST /api/orders/estimate-eta  (no auth required)
export const estimateEta = async (req, res) => {
  try {
    const { lat, lng, item_count = 5 } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    // Find nearest active warehouse
    const warehouses = await Warehouse.find({ is_active: true });
    if (!warehouses.length) {
      return res.json({
        eta_minutes: 10,
        distance_km: 0,
        warehouse_name: "Nearest Store",
      });
    }

    let nearest = warehouses[0];
    let minDist = haversineKm(
      lat,
      lng,
      nearest.location.lat,
      nearest.location.lng,
    );
    for (const wh of warehouses.slice(1)) {
      const d = haversineKm(lat, lng, wh.location.lat, wh.location.lng);
      if (d < minDist) {
        minDist = d;
        nearest = wh;
      }
    }

    // Call AI ETA service
    const aiUrl = process.env.AI_URL || "http://localhost:8000";
    let etaMinutes = Math.max(8, Math.round(minDist * 2 + 5)); // sensible fallback
    let distanceKm = Math.round(minDist * 10) / 10;
    try {
      const fakeItems = Array.from({ length: Number(item_count) || 5 }, () => ({
        qty: 1,
      }));
      const resp = await axios.post(`${aiUrl}/predict-eta`, {
        warehouse_id: nearest.warehouse_id,
        user_location: { lat, lng },
        items: fakeItems,
      });
      etaMinutes = resp.data.eta_minutes ?? etaMinutes;
      distanceKm = resp.data.distance_km ?? distanceKm;
    } catch {
      // AI unavailable – fallback already computed above
    }

    return res.json({
      eta_minutes: etaMinutes,
      distance_km: distanceKm,
      warehouse_id: nearest.warehouse_id,
      warehouse_name: nearest.name,
      warehouse_city: nearest.city ?? "",
    });
  } catch (error) {
    console.error("Estimate ETA error:", error);
    return res.status(500).json({ error: "Failed to estimate ETA" });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne(
      { order_id: orderId },
      { order_status: 1, eta_minutes: 1, order_id: 1, user_id: 1 },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Ensure users can only fetch status for their own orders
    if (req.user?.user_id && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      success: true,
      order_id: order.order_id,
      order_status: order.order_status,
      eta_minutes: order.eta_minutes,
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch order status" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUserId = req.user?.user_id;

    if (!requestedUserId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Users can only fetch their own orders.
    if (authenticatedUserId && authenticatedUserId !== requestedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const orders = await Order.find({ user_id: requestedUserId }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({ error: "Failed to fetch user orders" });
  }
};
