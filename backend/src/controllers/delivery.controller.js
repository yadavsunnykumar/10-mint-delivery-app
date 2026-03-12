import Order from "../models/order.model.js";

export const updateOrderStatus = async (req, res) => {
  const { order_id, status } = req.body;

  const validStatuses = [
    "assigned",
    "accepted",
    "packed",
    "en_route",
    "delivered"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { order_id },
    { order_status: status },
    { new: true }
  );

  // Emit status update
  const io = req.app.get("io");
  if (io) {
    io.emit(`order-${order_id}`, {
      type: "status",
      status
    });
  }

  return res.json(updatedOrder);
};