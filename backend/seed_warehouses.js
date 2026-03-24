/**
 * seed_warehouses.js
 * Upserts real Kathmandu Valley dark-store warehouse locations into MongoDB.
 * Run once:  node seed_warehouses.js
 *
 * All coordinates are verified real-world Kathmandu locations.
 * Average motorcycle speed in Kathmandu Valley: ~20 km/h (traffic included).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Warehouse from "./src/models/warehouse.model.js";

dotenv.config();

const WAREHOUSES = [
  {
    warehouse_id: "w1",
    name: "Dark Store – Thamel",
    location: { lat: 27.7152, lng: 85.3123 }, // Thamel Chowk, central Kathmandu
    address: "Thamel Chowk, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 5000,
    current_inventory: 3800,
    is_active: true,
  },
  {
    warehouse_id: "w2",
    name: "Dark Store – Patan",
    location: { lat: 27.6766, lng: 85.3159 }, // Mangal Bazar, Patan (Lalitpur)
    address: "Mangal Bazar, Patan",
    city: "Lalitpur",
    pincode: "44700",
    capacity: 4000,
    current_inventory: 2900,
    is_active: true,
  },
  {
    warehouse_id: "w3",
    name: "Dark Store – Baneshwor",
    location: { lat: 27.6943, lng: 85.3433 }, // New Baneshwor (busy corridor east of ring road)
    address: "New Baneshwor, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 4500,
    current_inventory: 3200,
    is_active: true,
  },
  {
    warehouse_id: "w4",
    name: "Dark Store – Boudha",
    location: { lat: 27.7215, lng: 85.3619 }, // Boudha Stupa area, NE Kathmandu
    address: "Boudha, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 3500,
    current_inventory: 2500,
    is_active: true,
  },
  {
    warehouse_id: "w5",
    name: "Dark Store – Koteshwor",
    location: { lat: 27.6832, lng: 85.3553 }, // Koteshwor, east ring road junction
    address: "Koteshwor, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 4000,
    current_inventory: 2800,
    is_active: true,
  },
  {
    warehouse_id: "w6",
    name: "Dark Store – Balaju",
    location: { lat: 27.7357, lng: 85.2989 }, // Balaju, NW Kathmandu
    address: "Balaju Industrial Area, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 3500,
    current_inventory: 2200,
    is_active: true,
  },
];

async function seed() {
  const uri =
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/zepto";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB:", uri.replace(/:\/\/.*@/, "://***@"));

  let created = 0;
  let updated = 0;

  for (const w of WAREHOUSES) {
    const result = await Warehouse.findOneAndUpdate(
      { warehouse_id: w.warehouse_id },
      { $set: w },
      { upsert: true, new: true },
    );
    if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
      created++;
    } else {
      updated++;
    }
    console.log(`  ✓ ${w.name}  (${w.location.lat}, ${w.location.lng})`);
  }

  console.log(`\nDone — ${created} created, ${updated} updated.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
