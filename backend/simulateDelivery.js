import axios from "axios";

const BASE = process.env.API_URL || "http://localhost:5001";

async function simulateDelivery(order_id, rider_id) {
  console.log("🚚 Starting delivery simulation...\n");

  // 1️⃣ Order Accepted by Warehouse
  await axios.post(`${BASE}/delivery/update-status`, {
    order_id,
    status: "accepted",
  });
  console.log("✔ Order accepted");

  // 2️⃣ Order Packed
  await axios.post(`${BASE}/delivery/update-status`, {
    order_id,
    status: "packed",
  });
  console.log("✔ Order packed");

  // 3️⃣ Rider Assigned
  await axios.post(`${BASE}/delivery/update-status`, {
    order_id,
    status: "assigned",
  });
  console.log("✔ Rider assigned");
  await new Promise((res) => setTimeout(res, 1500));

  // 4️⃣ Rider Starts Journey
  await axios.post(`${BASE}/delivery/update-status`, {
    order_id,
    status: "en_route",
  });
  console.log("✔ Order on the way");

  // 5️⃣ Move Rider Step-by-Step
  const path = [
    { lat: 27.7149, lng: 85.313 },
    { lat: 27.712, lng: 85.3148 },
    { lat: 27.709, lng: 85.316 },
    { lat: 27.7065, lng: 85.315 },
    { lat: 27.7042, lng: 85.3138 },
  ];

  for (let i = 0; i < path.length; i++) {
    await axios.post(`${BASE}/riders/update-location`, {
      rider_id,
      lat: path[i].lat,
      lng: path[i].lng,
    });

    await axios.post(`${BASE}/socket/send`, {
      event: `order-${order_id}`,
      data: {
        type: "location",
        rider_id,
        ...path[i],
      },
    });

    console.log(`📍 Rider moved to (${path[i].lat}, ${path[i].lng})`);
    await new Promise((res) => setTimeout(res, 1200));
  }

  // 5️⃣ Delivered
  await axios.post(`${BASE}/delivery/update-status`, {
    order_id,
    status: "delivered",
  });

  console.log("🎉 Order delivered!\n");
}

simulateDelivery("ORDER_ID_HERE", "r1");
