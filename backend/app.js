import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./src/routes/ai.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import riderRoutes from "./src/routes/rider.routes.js";
import deliveryRoutes from "./src/routes/delivery.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import socketRoutes from "./src/routes/socket.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import warehouseRoutes from "./src/routes/warehouse.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use("/ai", aiRoutes);
app.use("/orders", orderRoutes);
app.use("/riders", riderRoutes);
app.use("/delivery", deliveryRoutes);
app.use("/socket", socketRoutes);
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/warehouses", warehouseRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => res.send("Zepto API running"));
export default app;
