import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const getCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.json({ success: true, items: [], total: 0 });

    const productIds = cart.items.map((i) => String(i.product_id));
    const numericIds = productIds
      .filter((id) => !isNaN(+id) && id.trim() !== "")
      .map((id) => +id);
    const queryIds = [...new Set([...productIds, ...numericIds])];

    // Use native driver to bypass Mongoose schema casting (handles string & numeric _id)
    const productDocs = await Product.collection
      .find({ _id: { $in: queryIds } })
      .toArray();
    const productMap = {};
    for (const p of productDocs) {
      productMap[String(p._id)] = p;
    }

    const enriched = cart.items.map((item) => {
      const product = productMap[String(item.product_id)] || null;
      return { ...item.toObject(), product };
    });

    const total = enriched.reduce((sum, item) => {
      return sum + (item.product?.price ?? 0) * item.qty;
    }, 0);

    return res.json({ success: true, items: enriched, total });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id, qty = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id is required" });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne({ user_id });
    if (!cart) {
      cart = new Cart({ user_id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (i) => i.product_id === product_id,
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].qty += qty;
    } else {
      cart.items.push({ product_id, qty });
    }

    await cart.save();
    return res.json({ success: true, cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;
    const { qty } = req.body;

    if (qty === undefined || qty < 0) {
      return res
        .status(400)
        .json({ error: "qty is required and must be >= 0" });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    if (qty === 0) {
      cart.items = cart.items.filter((i) => i.product_id !== product_id);
    } else {
      const item = cart.items.find((i) => i.product_id === product_id);
      if (!item) return res.status(404).json({ error: "Item not in cart" });
      item.qty = qty;
    }

    await cart.save();
    return res.json({ success: true, cart });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({ error: "Failed to update cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { product_id } = req.params;

    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product_id !== product_id);
    await cart.save();
    return res.json({ success: true, cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    await Cart.findOneAndUpdate({ user_id }, { items: [] }, { new: true });
    return res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({ error: "Failed to clear cart" });
  }
};
