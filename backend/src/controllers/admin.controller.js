import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      originalPrice,
      discount,
      weight,
      rating,
      ratingCount,
      tag,
      image,
      stock,
    } = req.body;
    if (!name || !category || price == null || originalPrice == null) {
      return res.status(400).json({
        error: "name, category, price and originalPrice are required",
      });
    }
    // Validate image URL scheme to prevent XSS / javascript: injection
    if (image && !/^https?:\/\//i.test(image)) {
      return res.status(400).json({ error: "image must be an http/https URL" });
    }
    const _id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const product = new Product({
      _id,
      name,
      category,
      brand: brand || "",
      price: Number(price),
      originalPrice: Number(originalPrice),
      discount: discount || "MRP",
      weight: weight || "",
      rating: rating != null ? Number(rating) : 4.0,
      ratingCount: ratingCount || "0",
      tag: tag || null,
      image: image || "",
      stock: stock != null ? Number(stock) : 50,
    });
    await product.save();
    return res.status(201).json({ success: true, product });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create product" });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: 1 });
    return res.json({ success: true, products });
  } catch {
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ error: "Invalid stock value" });
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true },
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json({ success: true, product });
  } catch {
    return res.status(500).json({ error: "Failed to update stock" });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, orders });
  } catch {
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "created",
      "accepted",
      "packed",
      "assigned",
      "en_route",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const order = await Order.findOneAndUpdate(
      { order_id: orderId },
      { order_status: status },
      { new: true },
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json({ success: true, order });
  } catch {
    return res.status(500).json({ error: "Failed to update order status" });
  }
};
