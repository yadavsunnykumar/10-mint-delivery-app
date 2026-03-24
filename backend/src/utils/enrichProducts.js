import Product from "../models/product.model.js";

/**
 * Enrich order/cart items with product name, image, price and weight.
 * Uses the native MongoDB driver to bypass Mongoose schema casting so the
 * lookup works whether _id was stored as a number (legacy seed) or a string.
 *
 * @param {Array<{product_id: string|number, qty: number, price?: number}>} items
 * @returns {Promise<Array>} Enriched items
 */
export async function enrichItems(items) {
  const productIds = items.map((i) => String(i.product_id));
  const numericIds = productIds
    .filter((id) => !isNaN(+id) && id.trim() !== "")
    .map((id) => +id);
  const queryIds = [...new Set([...productIds, ...numericIds])];

  const productDocs = await Product.collection
    .find(
      { _id: { $in: queryIds } },
      { projection: { _id: 1, name: 1, image: 1, price: 1, weight: 1 } },
    )
    .toArray();

  const productMap = {};
  for (const p of productDocs) {
    productMap[String(p._id)] = p;
  }

  return items.map((i) => {
    const p = productMap[String(i.product_id)];
    return {
      product_id: i.product_id,
      qty: i.qty,
      name: p?.name ?? null,
      image: p?.image ?? "",
      price: p?.price ?? i.price ?? null,
      weight: p?.weight ?? "",
    };
  });
}
