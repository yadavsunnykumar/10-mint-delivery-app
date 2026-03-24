import Order from "../models/order.model.js";

const VALID_STATUSES = [
  "created",
  "accepted",
  "packed",
  "assigned",
  "en_route",
  "delivered",
  "cancelled",
];

export const updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
      return res
        .status(400)
        .json({ error: "order_id and status are required" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { order_id },
      { order_status: status },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.emit(`order-${order_id}`, { type: "status", status });
    }

    return res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
};
