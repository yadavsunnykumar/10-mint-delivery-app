import mongoose from "mongoose";

const WarehouseSchema = new mongoose.Schema(
  {
    warehouse_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    address: String,
    city: String,
    pincode: String,
    phone: String,
    capacity: Number,
    current_inventory: Number,
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Warehouse", WarehouseSchema);
