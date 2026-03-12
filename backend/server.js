import app from "./app.js";
import { connectDB } from "./src/config/mongo.js";
import { Server } from "socket.io";
import http from "http";

// Connect to MongoDB
connectDB();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Rider connected:", socket.id);

  socket.on("rider-location", async (data) => {
    // data = { rider_id, lat, lng, order_id }
    io.emit(`order-${data.order_id}`, data);
  });

  socket.on("disconnect", () => {
    console.log("Rider disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`Server is running with Socket.io on http://localhost:${PORT}`);
});
