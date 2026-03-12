import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  phone: { type: String, required: true, unique: true },
  warehouse_id: { type: String, default: "w1" },
  location: {
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    address: { type: String, default: "Indiranagar, Bengaluru" },
  },
  otp: { type: String, default: null },
  otp_expires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema);
