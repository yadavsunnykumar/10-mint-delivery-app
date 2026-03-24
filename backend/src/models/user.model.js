import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, default: null },
  phone: { type: String, required: true, unique: true },
  alt_phone: { type: String, default: null },
  avatar: { type: String, default: null },
  warehouse_id: { type: String, default: "w1" },
  location: {
    lat: { type: Number, default: 27.7172 },
    lng: { type: Number, default: 85.324 },
    address: { type: String, default: "Thamel, Kathmandu" },
  },
  otp: { type: String, default: null },
  otp_expires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
