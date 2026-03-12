import mongoose from "mongoose";

const DeliveryPartnerSchema = new mongoose.Schema(
  {
    rider_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: String,
    phone: String,
    vehicle_number: String,

    // Rider availability
    is_active: { type: Boolean, default: true },
    is_available: { type: Boolean, default: true },

    // Real-time location
    current_location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true },
);

export default mongoose.model("DeliveryPartner", DeliveryPartnerSchema);
