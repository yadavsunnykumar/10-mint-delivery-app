/**
 * Applies correct Unsplash images directly to MongoDB for all 103 products.
 * Run: node fix_db_images.js
 */
import mongoose from "mongoose";
import { connectDB } from "./src/config/mongo.js";
import Product from "./src/models/product.model.js";
import "dotenv/config";

const IMAGE_MAP = {
  // ── Fruits & Vegetables ──────────────────────────────────────────────────
  1: "photo-1528825871115-3581a5387919", // Fresh Bananas
  2: "photo-1560806887-1e4cd0b6cbd6",   // Red Apples
  3: "photo-1592924357228-91a4daadcfea", // Fresh Tomatoes
  4: "photo-1576045057995-568f588f82fb", // Organic Spinach
  5: "photo-1518977676601-b53f82aba655", // Fresh Potatoes
  20: "photo-1618512496248-a07fe83aa8cb", // Fresh Onions
  21: "photo-1598170845058-32b9d6a5da37", // Carrots
  22: "photo-1563565375-f3fdfdbefa83",  // Green Capsicum
  23: "photo-1553279768-865429fa0078",  // Alphonso Mangoes
  24: "photo-1615485500704-8e990f9900f7", // Fresh Ginger

  // ── Atta, Rice & Dals ────────────────────────────────────────────────────
  6: "photo-1604908177522-402c9f9e02b8",  // Aashirvaad Whole Wheat Atta
  7: "photo-1586201375761-83865001e31c",  // India Gate Basmati Rice
  8: "photo-1610725664285-7c57e6eeac3f",  // Tata Sampann Toor Dal
  25: "photo-1505253758473-96b7015fcd40", // Chana Dal
  26: "photo-1515562141207-7a88fb7ce338", // Organic Moong Dal
  27: "photo-1536304929831-ee1ca9d44906", // Sona Masoori Rice
  28: "photo-1574226882818-b27b0f3cf06f", // Multigrain Atta

  // ── Masala & Dry Fruits ──────────────────────────────────────────────────
  9: "photo-1601050690597-df0568f70950",  // Everest Garam Masala
  10: "photo-1606923829579-0cb981a83e2c", // Premium Almonds
  29: "photo-1509358271058-acd22cc93898", // Cashews Premium
  30: "photo-1562280963-8a5475740a10",  // Turmeric Powder
  31: "photo-1599599810769-bcde5a160d32", // Raisins Kishmish
  32: "photo-1596040033229-a9821ebd058d", // Red Chilli Powder

  // ── Breakfast & Sauces ───────────────────────────────────────────────────
  11: "photo-1521483451569-e33803c0330c", // Kellogg's Cornflakes
  12: "photo-1472476443507-c7a5948772fc", // Kissan Ketchup
  33: "photo-1517673400267-0251440c45dc", // Quaker Oats
  34: "photo-1472476443507-c7a5948772fc", // Maggi Hot & Sweet Sauce
  35: "photo-1546069901-ba9599a7e63c",  // Muesli Fruit & Nut
  36: "photo-1574498547776-5ebe5b9c5a78", // Creamy Peanut Butter

  // ── Ice Creams ───────────────────────────────────────────────────────────
  13: "photo-1563805042-7684c019e1cb",  // Amul Vanilla Ice Cream
  37: "photo-1580915411954-282cb1b0d780", // Chocolate Brownie Ice Cream
  38: "photo-1551024506-0bccd828d307",  // Butterscotch Ice Cream
  39: "photo-1559622214-f8a9850965bb",  // Mango Sorbet
  40: "photo-1551024709-8f23befc6f87",  // Kulfi Malai Stick
  41: "photo-1488900128323-21503983a07e", // Strawberry Ice Cream Tub

  // ── Frozen Food ──────────────────────────────────────────────────────────
  14: "photo-1585238342028-4f2c5b13a8b0", // Frozen French Fries
  42: "photo-1551754655-cd27e38d2076",  // Frozen Corn Kernels
  43: "photo-1562967914-608f82629710",  // Chicken Nuggets
  44: "photo-1587411768638-ec71f8e33b78", // Frozen Peas
  45: "photo-1574158622682-e40e69881006", // Pizza Base Frozen
  46: "photo-1585032226651-759b368d7246", // Veg Momos Frozen

  // ── Home & Cleaning ──────────────────────────────────────────────────────
  15: "photo-1558618047-3c8c76ca7d13",  // Surf Excel Detergent
  47: "photo-1585740510052-0e2486b9ce86", // Vim Dishwash Bar
  48: "photo-1563453392212-326f5e854473", // Harpic Bathroom Cleaner
  49: "photo-1558618666-fcd25c85cd64",  // Colin Glass Cleaner
  50: "photo-1629011822867-e1e12c3cbf19", // Good Night Mosquito Liquid
  51: "photo-1581578731548-c64695cc6952", // Scotch Brite Scrub Pad

  // ── Toys & Games ─────────────────────────────────────────────────────────
  16: "photo-1606813907291-d86efa9b94db", // Remote Control Car
  52: "photo-1587654780291-39c9404d746b", // Lego Building Blocks
  53: "photo-1637073849667-8f4e4e3f0c10", // Board Game Snakes & Ladders
  54: "photo-1519817914152-22d216bb9170", // Rubik's Cube
  55: "photo-1596461404969-9ae70f2830c1", // Play-Doh Modelling Clay
  56: "photo-1594751543129-36c5a2d73e27", // Nerf Gun Blaster

  // ── Electronics ──────────────────────────────────────────────────────────
  17: "photo-1585386959984-a41552231658", // Wireless Bluetooth Earbuds
  57: "photo-1601597111158-2fceff292cdc", // USB-C Fast Charging Cable
  58: "photo-1609592806596-b3b524c7c48e", // Portable Power Bank
  59: "photo-1550408483-bafa35b0a5af",  // Smart LED Bulb
  60: "photo-1593642632559-0c6d3fc62b89", // Laptop Stand Adjustable
  61: "photo-1527864550417-7fd91fc51a46", // Wireless Mouse

  // ── Beauty & Personal Care ───────────────────────────────────────────────
  18: "photo-1608248543803-ba4f8c70ae0b", // Colgate Toothpaste
  62: "photo-1556228578-8c89e6adf883",  // Dove Body Lotion
  63: "photo-1580870069867-74c57ee1bb07", // Sunscreen SPF 50
  64: "photo-1528360983277-13d401cdc186", // Head & Shoulders Shampoo
  65: "photo-1512163143273-bde0e3cc7407", // Gillette Shaving Gel
  66: "photo-1556228720-195a672e8a03",  // Himalaya Face Wash Neem

  // ── Fashion ──────────────────────────────────────────────────────────────
  19: "photo-1520975916090-3105956dac38", // Men Cotton T-Shirt
  67: "photo-1594938298603-c8148c4b4057", // Women Kurti Floral Print
  68: "photo-1542291026-7eec264c27ff",  // Running Shoes Men
  69: "photo-1542272454315-4c01d7abdf4a", // Casual Denim Jeans
  70: "photo-1610030469983-98e550d6193c", // Silk Saree Kanjivaram
  71: "photo-1556906781-9a414e2a7735",  // Sports Shorts Men

  // ── Beverages ────────────────────────────────────────────────────────────
  72: "photo-1554866585-cd94860890b7",  // Coca-Cola 2L
  73: "photo-1621506289937-a8e4df240d0b", // Tropicana Orange Juice
  74: "photo-1548839140-29a749e1cf4d",  // Bisleri Mineral Water
  75: "photo-1532235238-8b04d1ab4024",  // Red Bull Energy Drink
  76: "photo-1556679343-c7306c1976bc",  // Lipton Green Tea Bags
  77: "photo-1509042239860-f550ce710b93", // Nescafe Classic Coffee
  78: "photo-1625772299848-391b6a87d7b3", // Sprite Lemon Lime
  79: "photo-1546173159-315724a39694",  // Maaza Mango Drink

  // ── Dairy, Bread & Eggs ──────────────────────────────────────────────────
  80: "photo-1563636619-e9143da7973b",  // Amul Gold Full Cream Milk
  81: "photo-1509440159596-0249088772ff", // Britannia Brown Bread
  82: "photo-1569288063643-5d29ad64df09", // Farm Fresh Eggs Tray
  83: "photo-1589985270826-4b7bb135bc9d", // Amul Salted Butter
  84: "photo-1571212515416-fef01fc43637", // Mother Dairy Curd
  85: "photo-1552767059-ce182ead6c1b",  // Amul Processed Cheese Slices
  86: "photo-1549931319-a545dcf3bc7c",  // Multigrain Bread Loaf
  87: "photo-1488477181946-6428a0291777", // Amul Masti Dahi

  // ── Instant Food ─────────────────────────────────────────────────────────
  88: "photo-1569718212165-3a8278d5f624", // Maggi 2-Minute Noodles
  89: "photo-1547592180-85f173990554",  // Knorr Tomato Soup
  90: "photo-1630390736891-4aee5cf027cb", // Poha Ready to Cook
  91: "photo-1612929633738-8fe44f7ec841", // Cup Noodles Chicken
  92: "photo-1504674900247-0877df9cc836", // Upma Rava Instant Mix
  93: "photo-1585937421612-70a008356fbe", // Dal Makhani Ready to Eat
  94: "photo-1563379926898-05f4575a45d8", // Pasta Instant Masala
  95: "photo-1589301760014-d929f3979dbc", // Biryani Instant Mix

  // ── Snacks & Munchies ────────────────────────────────────────────────────
  96: "photo-1566478989037-eec170784d0b", // Lay's Classic Salted Chips
  97: "photo-1575389583827-1e56d22f4b71", // Kurkure Masala Munch
  98: "photo-1621939514649-280e2ee25f60", // Haldiram's Aloo Bhujia
  99: "photo-1499636136210-6f4ee915583e", // Oreo Original Biscuits
  100: "photo-1558961363-fa8fdf82db35", // Britannia Good Day Cashew
  101: "photo-1513558161293-cdaf765ed2fd", // Cornitos Nachos Cheese
  102: "photo-1606923829579-0cb981a83e2c", // Mixed Dry Fruits Trail Mix
  103: "photo-1621939514649-280e2ee25f60", // Parle-G Biscuits
};

async function run() {
  await connectDB();

  let updated = 0;
  const ops = Object.entries(IMAGE_MAP).map(([id, photoId]) => ({
    updateOne: {
      filter: { _id: String(id) },
      update: {
        $set: {
          image: `https://images.unsplash.com/${photoId}?w=300&q=80&fit=crop`,
        },
      },
    },
  }));

  const result = await Product.bulkWrite(ops);
  updated = result.modifiedCount;

  console.log(`✅ Updated ${updated} products in MongoDB`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
