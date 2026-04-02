import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    order_id: { type: String, required: true, unique: true },
    warehouse_id: { type: String, required: true },

    // Customer GPS at time of order
    user_location: { type: Object, required: true },

    // Items with price snapshot to survive product price changes
    items: [
      {
        product_id: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, default: null },
      },
    ],

    // Financial
    total_amount: { type: Number, required: true },
    promo_code: { type: String, default: null },
    promo_discount: { type: Number, default: 0 },

    // Payment
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    payment_method: {
      type: String,
      enum: ["upi", "card", "cod", "wallet"],
      default: "cod",
    },

    // Delivery status
    order_status: {
      type: String,
      enum: ["created", "accepted", "packed", "assigned", "en_route", "delivered", "cancelled"],
      default: "created",
    },

    // ETA from AI model
    eta_minutes: { type: Number },

    // Delivery partner
    rider_id: { type: String, default: null },
    delivered_at: { type: Date },
    cancellation_reason: { type: String, default: null },

    // Special delivery notes from customer
    delivery_instructions: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("Order", OrderSchema);
