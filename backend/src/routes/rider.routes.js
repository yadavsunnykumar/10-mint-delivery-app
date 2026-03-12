import express from "express";
import DeliveryPartner from "../models/deliveryPartner.model.js";

const router = express.Router();

// Get active riders
router.get("/", async (req, res) => {
  const riders = await DeliveryPartner.find({ is_active: true });
  res.json(riders);
});

// Update rider location
router.post("/update-location", async (req, res) => {
  try {
    const { rider_id, lat, lng } = req.body;

    // Query by custom rider_id field
    // check if it is a valid object id, if so we likely want to find by _id, UNLESS rider_id can also look like an objectId.
    // However, given the error "r1", let's prioritize the custom field or just assume rider_id refers to the custom field.
    // The previous comment said "works for both", but findById throws if it fails casting.
    
    // We will query by rider_id (custom string field)
    const rider = await DeliveryPartner.findOne({ rider_id });
    if (!rider) return res.status(404).json({ error: "Rider not found" });

    const updated = await DeliveryPartner.findOneAndUpdate(
      { rider_id },
      { current_location: { lat, lng } },
      { new: true },
    );

    res.json({ success: true, rider: updated });
  } catch (error) {
    console.error("Error updating rider location:", error);
    res.status(500).json({ error: "Failed to update rider location" });
  }
});

export default router;
