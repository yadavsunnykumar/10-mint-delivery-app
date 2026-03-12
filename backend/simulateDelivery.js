import axios from "axios";

const BASE = process.env.API_URL || "http://localhost:6000";

async function simulateDelivery(order_id, rider_id) {
    console.log("🚚 Starting delivery simulation...\n");

    // 1️⃣ Order Accepted by Warehouse
    await axios.post(`${BASE}/delivery/update-status`, {
        order_id,
        status: "accepted"
    });
    console.log("✔ Order accepted");

    // 2️⃣ Order Packed
    await axios.post(`${BASE}/delivery/update-status`, {
        order_id,
        status: "packed"
    });
    console.log("✔ Order packed");

    // 3️⃣ Rider Starts Journey
    await axios.post(`${BASE}/delivery/update-status`, {
        order_id,
        status: "en_route"
    });
    console.log("✔ Order on the way");

    // 4️⃣ Move Rider Step-by-Step
    const path = [
        { lat: 12.9720, lng: 77.6400 },
        { lat: 12.9715, lng: 77.6390 },
        { lat: 12.9710, lng: 77.6380 },
        { lat: 12.9705, lng: 77.6370 },
        { lat: 12.9700, lng: 77.6360 }
    ];

    for (let i = 0; i < path.length; i++) {
        await axios.post(`${BASE}/riders/update-location`, {
            rider_id,
            lat: path[i].lat,
            lng: path[i].lng
        });

        await axios.post(`${BASE}/socket/send`, {
            event: `order-${order_id}`,
            data: {
                type: "location",
                rider_id,
                ...path[i]
            }
        });

        console.log(`📍 Rider moved to (${path[i].lat}, ${path[i].lng})`);
        await new Promise(res => setTimeout(res, 1200));
    }

    // 5️⃣ Delivered
    await axios.post(`${BASE}/delivery/update-status`, {
        order_id,
        status: "delivered"
    });

    console.log("🎉 Order delivered!\n");
}

simulateDelivery("ORDER_ID_HERE", "r1");
