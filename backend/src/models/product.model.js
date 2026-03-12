import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: String,
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: String, default: "MRP" },
  weight: { type: String, default: "" },
  rating: { type: Number, default: 4.0 },
  ratingCount: { type: String, default: "0" },
  tag: { type: String, default: null },
  sales: { type: Number, default: 0 },
  tags: [String],
  image: { type: String, default: "" },
  stock: { type: Number, default: 50 },
});

export default mongoose.model("Product", ProductSchema);
