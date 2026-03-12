import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },

    order_id: {
      type: String,
      required: true,
      unique: true,
    },

    warehouse_id: {
      type: String,
      required: true,
    },

    // Example: { lat: 12.97, lng: 77.59 }
    user_location: {
      type: Object,
      required: true,
    },

    items: [
      {
        product_id: { type: String, required: true },
        qty: { type: Number, required: true },
      },
    ],

    // ETA from AI model
    eta_minutes: {
      type: Number,
      required: false,
    },

    // Order financial details
    total_amount: {
      type: Number,
      required: true,
    },

    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    order_status: {
      type: String,
      enum: [
        "created",
        "accepted",
        "packed",
        "assigned",
        "en_route",
        "delivered",
        "cancelled",
      ],
      default: "created",
    },

    // Delivery partner info
    rider_id: {
      type: String,
      default: null,
    },

    delivered_at: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", OrderSchema);
