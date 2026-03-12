import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Cart", CartSchema);
