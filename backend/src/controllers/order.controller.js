import Order from "../models/order.model.js";
import Warehouse from "../models/warehouse.model.js";
import DeliveryPartner from "../models/deliveryPartner.model.js";
import Product from "../models/product.model.js";
import axios from "axios";
import { findNearestRider } from "../utils/findNearestRider.js";
import { haversineKm } from "../utils/distance.js";

export const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      warehouse_id,
      user_location,
      items,
      total_amount,
      payment_method = "cod",
      promo_code = null,
      promo_discount = 0,
      delivery_instructions = "",
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
      payment_method,
      promo_code,
      promo_discount,
      delivery_instructions,
      eta_minutes: etaMinutes,
      rider_id: rider?._id || null,
    });

    // Increment sales count for each product ordered
    const productSalesBulk = items.map((item) => ({
      updateOne: {
        filter: { _id: String(item.product_id) },
        update: { $inc: { sales: item.qty ?? 1 } },
      },
    }));
    if (productSalesBulk.length) {
      await Product.bulkWrite(productSalesBulk).catch(() => {});
    }

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
      { order_status: 1, eta_minutes: 1, order_id: 1, user_id: 1, rider_id: 1 },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Ensure users can only fetch status for their own orders
    if (req.user?.user_id && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Populate rider info when assigned
    let rider = null;
    if (order.rider_id) {
      const riderDoc = await DeliveryPartner.findById(order.rider_id, {
        name: 1,
        phone: 1,
        vehicle_number: 1,
        current_location: 1,
        rider_id: 1,
      });
      if (riderDoc) {
        rider = {
          name: riderDoc.name,
          phone: riderDoc.phone,
          vehicle_number: riderDoc.vehicle_number,
          rider_id: riderDoc.rider_id,
          current_location: riderDoc.current_location,
        };
      }
    }

    return res.json({
      success: true,
      order_id: order.order_id,
      order_status: order.order_status,
      eta_minutes: order.eta_minutes,
      rider,
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch order status" });
  }
};

// GET /api/orders/tracking/:orderId  — full tracking payload for the live map
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ order_id: orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (req.user?.user_id && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let rider = null;
    if (order.rider_id) {
      const riderDoc = await DeliveryPartner.findById(order.rider_id);
      if (riderDoc) {
        rider = {
          name: riderDoc.name,
          phone: riderDoc.phone,
          vehicle_number: riderDoc.vehicle_number,
          rider_id: riderDoc.rider_id,
          current_location: riderDoc.current_location,
        };
      }
    }

    // Enrich items with product names and images.
    // Use the native MongoDB collection to bypass Mongoose schema casting so
    // the lookup works whether _id was stored as a number (legacy seed) or a string.
    const productIds = order.items.map((i) => String(i.product_id));
    const numericIds = productIds
      .filter((id) => !isNaN(+id) && id.trim() !== "")
      .map((id) => +id);
    const queryIds = [...new Set([...productIds, ...numericIds])];

    const productDocs = await Product.collection
      .find(
        { _id: { $in: queryIds } },
        { projection: { _id: 1, name: 1, image: 1, price: 1, weight: 1 } },
      )
      .toArray();

    const productMap = {};
    for (const p of productDocs) {
      productMap[String(p._id)] = p;
    }
    const enrichedItems = order.items.map((i) => {
      const p = productMap[String(i.product_id)];
      return {
        product_id: i.product_id,
        qty: i.qty,
        name: p?.name ?? null,
        image: p?.image ?? "",
        price: p?.price ?? null,
        weight: p?.weight ?? "",
      };
    });

    // Warehouse info
    let warehouse_location = null;
    let warehouse_name = null;
    const wh = await Warehouse.findOne(
      { warehouse_id: order.warehouse_id },
      { location: 1, name: 1 },
    );
    if (wh) {
      warehouse_location = wh.location;
      warehouse_name = wh.name;
    }

    // ── Live distance-based ETA ──────────────────────────────────────────
    // Source point: rider's current GPS if available, else warehouse
    // Destination:  customer's saved user_location
    // Formula: ceil(distance_km / 20 km·h⁻¹ * 60) + 2 min buffer
    //          (20 km/h = realistic Kathmandu average incl. traffic)
    let eta_minutes = order.eta_minutes ?? 10; // keep stored value as fallback
    const dest = order.user_location;
    if (dest) {
      const source = rider?.current_location ?? warehouse_location;
      if (source) {
        const distKm = haversineKm(source.lat, source.lng, dest.lat, dest.lng);
        eta_minutes = Math.max(2, Math.ceil((distKm / 20) * 60) + 2);
      }
    }
    // For delivered/cancelled orders just return 0
    if (["delivered", "cancelled"].includes(order.order_status))
      eta_minutes = 0;

    return res.json({
      success: true,
      order_id: order.order_id,
      order_status: order.order_status,
      eta_minutes,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      created_at: order.createdAt,
      warehouse_id: order.warehouse_id,
      warehouse_name,
      items: enrichedItems,
      user_location: order.user_location,
      warehouse_location,
      rider,
    });
  } catch (error) {
    console.error("Get order tracking error:", error);
    return res.status(500).json({ error: "Failed to fetch tracking data" });
  }
};

// POST /api/orders/cancel/:orderId
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({ order_id: orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Only the order owner can cancel
    if (req.user?.user_id && order.user_id !== req.user.user_id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const cancellableStatuses = ["created", "accepted"];
    if (!cancellableStatuses.includes(order.order_status)) {
      return res.status(400).json({
        error: `Cannot cancel order in '${order.order_status}' status. Only orders in 'created' or 'accepted' can be cancelled.`,
      });
    }

    order.order_status = "cancelled";
    if (reason) order.cancellation_reason = reason;
    await order.save();

    // Free up the rider if one was assigned
    if (order.rider_id) {
      await DeliveryPartner.findByIdAndUpdate(order.rider_id, { is_available: true }).catch(() => {});
    }

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) io.emit(`order-${orderId}`, { order_status: "cancelled" });

    return res.json({ success: true, order_id: orderId, order_status: "cancelled" });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ error: "Failed to cancel order" });
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
