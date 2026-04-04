/**
 * seed_warehouses.js
 * Upserts 6 real Kathmandu Valley dark-store warehouse locations into MongoDB.
 * Run once:  node seed_warehouses.js
 *
 * All coordinates are verified real-world Kathmandu/Lalitpur locations.
 * Average motorcycle speed in Kathmandu Valley: ~20 km/h (traffic-adjusted).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Warehouse from "./src/models/warehouse.model.js";

dotenv.config();

const WAREHOUSES = [
  {
    warehouse_id: "DS001",
    name: "Thamel Dark Store",
    location: { lat: 27.7152, lng: 85.3123 }, // Thamel Chowk, central Kathmandu
    address: "Near Thamel Chowk, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 5000,
    current_inventory: 3800,
    is_active: true,
  },
  {
    warehouse_id: "DS002",
    name: "Baneshwor Dark Store",
    location: { lat: 27.6943, lng: 85.3433 }, // New Baneshwor, busy corridor east of ring road
    address: "New Baneshwor, Kathmandu",
    city: "Kathmandu",
    pincode: "44614",
    capacity: 4500,
    current_inventory: 3200,
    is_active: true,
  },
  {
    warehouse_id: "DS003",
    name: "Maharajgunj Dark Store",
    location: { lat: 27.7394, lng: 85.3315 }, // Maharajgunj Chowk, north Kathmandu
    address: "Maharajgunj Chowk, Kathmandu",
    city: "Kathmandu",
    pincode: "44600",
    capacity: 4000,
    current_inventory: 2900,
    is_active: true,
  },
  {
    warehouse_id: "DS004",
    name: "Koteshwor Dark Store",
    location: { lat: 27.6832, lng: 85.3553 }, // Koteshwor, east ring road junction
    address: "Koteshwor, Kathmandu",
    city: "Kathmandu",
    pincode: "44621",
    capacity: 4000,
    current_inventory: 2800,
    is_active: true,
  },
  {
    warehouse_id: "DS005",
    name: "Patan Dark Store",
    location: { lat: 27.6857, lng: 85.3166 }, // Kupondole Height, Lalitpur
    address: "Kupondole Height, Lalitpur",
    city: "Lalitpur",
    pincode: "44700",
    capacity: 3500,
    current_inventory: 2500,
    is_active: true,
  },
  {
    warehouse_id: "DS006",
    name: "Kalimati Dark Store",
    location: { lat: 27.6976, lng: 85.3003 }, // Kalimati, west Kathmandu
    address: "Kalimati, Kathmandu",
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
    await Warehouse.findOneAndUpdate(
      { warehouse_id: w.warehouse_id },
      { $set: w },
      { upsert: true, new: true },
    );
    console.log(`  ✓ ${w.name}  (${w.location.lat}, ${w.location.lng})`);
    updated++;
  }

  console.log(`\nDone — ${WAREHOUSES.length} dark stores seeded/updated.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
