import Product from "../models/product.model.js";

const toFrontendShape = (p) => ({
  id: p._id,
  name: p.name,
  image: p.image,
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discount,
  weight: p.weight,
  rating: p.rating,
  ratingCount: p.ratingCount,
  tag: p.tag ?? undefined,
  category: p.category,
  brand: p.brand,
  stock: p.stock ?? 50,
});

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const query = {};
    if (category) query.category = { $regex: new RegExp(`^${category}$`, "i") };
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { brand: re }, { tags: re }];
    }

    let cursor = Product.find(query).sort({ sales: -1, name: 1 });
    if (limit) cursor = cursor.limit(Number(limit));

    const products = await cursor;
    return res.json({ success: true, products: products.map(toFrontendShape) });
  } catch (error) {
    console.error("Get all products error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ success: true, product: toFrontendShape(product) });
  } catch (error) {
    console.error("Get product by id error:", error);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);
    return res.json({ success: true, categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};
