import Product from "../models/product.model.js";

const toFrontendShape = (p) => ({
  id: p._id,
  name: p.name,
  image: p.image,
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discount,
  weight: p.weight,
  unit: p.unit ?? "",
  rating: p.rating,
  ratingCount: typeof p.ratingCount === "string" ? Number(p.ratingCount) || 0 : (p.ratingCount ?? 0),
  tag: p.tag ?? undefined,
  category: p.category,
  brand: p.brand,
  description: p.description ?? "",
  stock: p.stock ?? 50,
  tags: p.tags ?? [],
});

export const getAllProducts = async (req, res) => {
  try {
    const { category, search, limit, offset, sort } = req.query;
    const query = {};
    if (category) query.category = { $regex: new RegExp(`^${category}$`, "i") };
    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ name: re }, { brand: re }, { tags: re }, { description: re }];
    }

    // Sorting
    const sortMap = {
      popular: { sales: -1, name: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      name: { name: 1 },
    };
    const sortOrder = sortMap[sort] ?? { sales: -1, name: 1 };

    let cursor = Product.find(query).sort(sortOrder);
    const parsedOffset = Number(offset) || 0;
    const parsedLimit = Number(limit) || 0;
    if (parsedOffset) cursor = cursor.skip(parsedOffset);
    if (parsedLimit) cursor = cursor.limit(parsedLimit);

    const [products, total] = await Promise.all([
      cursor,
      Product.countDocuments(query),
    ]);
    return res.json({ success: true, products: products.map(toFrontendShape), total, offset: parsedOffset });
  } catch (error) {
    console.error("Get all products error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    // Support both string and numeric _id
    const product =
      (await Product.findById(id)) ??
      (await Product.collection.findOne({ _id: isNaN(+id) ? id : +id }));

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
