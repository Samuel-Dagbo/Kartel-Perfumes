import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { products as productData, testUsers as userData } from "../src/lib/product-data";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [{ type: String }],
    scentNotes: { top: [{ type: String }], heart: [{ type: String }], base: [{ type: String }] },
    concentration: { type: String, required: true },
    volume: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer", "staff"], default: "customer" },
    phone: { type: String },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
    paymentMethod: { type: String, required: true },
    customer: { name: { type: String, required: true }, email: { type: String, required: true } },
    shippingAddress: {
      line1: { type: String, required: true }, line2: { type: String },
      city: { type: String, required: true }, state: { type: String, required: true },
      zip: { type: String, required: true }, country: { type: String, default: "US" },
    },
  },
  { timestamps: true }
);

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
  {
    saleNumber: { type: String, required: true, unique: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card", "transfer"], required: true },
    customerName: { type: String },
    customerEmail: { type: String },
    salesPerson: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  const productCount = await Product.countDocuments();
  if (productCount !== productData.length) {
    if (productCount > 0) {
      await Product.deleteMany({});
      console.log(`  Removed ${productCount} old products`);
    }
    const productsWithSlugs = productData.map((p) => ({ ...p, slug: slugify(p.name) }));
    await Product.insertMany(productsWithSlugs);
    console.log(`  Seeded ${productData.length} products`);
  } else {
    console.log(`  Products already seeded (${productCount}), up to date`);
  }

  const oldUsers = await User.find({ email: /@maisonnoire\.com$/ });
  for (const old of oldUsers) {
    const newEmail = old.email.replace("@maisonnoire.com", "@kartel.com");
    await User.updateOne({ _id: old._id }, { $set: { email: newEmail } });
  }
  if (oldUsers.length > 0) {
    console.log(`  Migrated ${oldUsers.length} user emails to @kartel.com`);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const usersWithHashes = await Promise.all(
      userData.map(async (u) => ({
        email: u.email,
        name: u.name,
        passwordHash: await bcrypt.hash(u.password, 12),
        role: u.role,
        phone: u.phone,
      }))
    );
    await User.insertMany(usersWithHashes);
    console.log(`  Seeded ${userData.length} test users`);
  } else {
    let updatedCount = 0;
    for (const u of userData) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create({
          email: u.email,
          name: u.name,
          passwordHash: await bcrypt.hash(u.password, 12),
          role: u.role,
          phone: u.phone,
        });
        updatedCount++;
      } else {
        const needsUpdate = existing.name !== u.name || existing.role !== u.role;
        if (needsUpdate) {
          await User.updateOne({ _id: existing._id }, { name: u.name, role: u.role, phone: u.phone });
          updatedCount++;
        }
      }
    }
    if (updatedCount > 0) console.log(`  Updated ${updatedCount} existing users`);
    console.log(`  Users already exist (${userCount}), up to date`);
  }

  const allProducts = await Product.find().lean();
  if (allProducts.length === 0) {
    console.log("  No products found, skipping orders/sales");
    await mongoose.disconnect();
    console.log("\nDone.");
    return;
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    const sampleOrders = [
      {
        orderNumber: genId("ORD"), status: "delivered", paymentStatus: "paid", paymentMethod: "card",
        items: [{ product: allProducts[0]._id, name: allProducts[0].name, price: allProducts[0].price, quantity: 2, image: allProducts[0].images[0] }],
        subtotal: allProducts[0].price * 2, tax: Math.round(allProducts[0].price * 2 * 0.08 * 100) / 100, shipping: 0, total: 0,
        customer: { name: "Isabelle Moreau", email: "customer@kartel.com" },
        shippingAddress: { line1: "42 Rue de la Paix", city: "New York", state: "NY", zip: "10012", country: "US" },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: genId("ORD"), status: "processing", paymentStatus: "paid", paymentMethod: "card",
        items: [{ product: allProducts[2]._id, name: allProducts[2].name, price: allProducts[2].price, quantity: 1, image: allProducts[2].images[0] }],
        subtotal: allProducts[2].price, tax: Math.round(allProducts[2].price * 0.08 * 100) / 100, shipping: 15, total: 0,
        customer: { name: "James Walker", email: "james@example.com" },
        shippingAddress: { line1: "88 Bedford Ave", city: "Brooklyn", state: "NY", zip: "11211", country: "US" },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        orderNumber: genId("ORD"), status: "pending", paymentStatus: "pending", paymentMethod: "card",
        items: [{ product: allProducts[4]._id, name: allProducts[4].name, price: allProducts[4].price, quantity: 1, image: allProducts[4].images[0] }],
        subtotal: allProducts[4].price, tax: Math.round(allProducts[4].price * 0.08 * 100) / 100, shipping: 0, total: 0,
        customer: { name: "Sofia Reyes", email: "sofia@example.com" },
        shippingAddress: { line1: "15 Washington Sq", city: "New York", state: "NY", zip: "10003", country: "US" },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];
    const toInsert = sampleOrders.map((o) => ({ ...o, total: Math.round((o.subtotal + o.tax + o.shipping) * 100) / 100 }));
    await Order.insertMany(toInsert);
    console.log(`  Seeded ${sampleOrders.length} sample orders`);
  } else {
    console.log(`  Orders already exist (${orderCount}), skipping`);
  }

  const saleCount = await Sale.countDocuments();
  if (saleCount === 0) {
    const sampleSales = [
      {
        saleNumber: genId("POS"), paymentMethod: "card", salesPerson: "Marcus Chen", customerName: "Walk-in Customer",
        items: [{ product: allProducts[1]._id, name: allProducts[1].name, price: allProducts[1].price, quantity: 1 }],
        subtotal: allProducts[1].price, tax: Math.round(allProducts[1].price * 0.08 * 100) / 100,
        total: Math.round(allProducts[1].price * 1.08 * 100) / 100,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        saleNumber: genId("POS"), paymentMethod: "cash", salesPerson: "Helene Voss", customerName: "Elena Vogt",
        items: [{ product: allProducts[5]._id, name: allProducts[5].name, price: allProducts[5].price, quantity: 2 }],
        subtotal: allProducts[5].price * 2, tax: Math.round(allProducts[5].price * 2 * 0.08 * 100) / 100,
        total: Math.round(allProducts[5].price * 2 * 1.08 * 100) / 100,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];
    await Sale.insertMany(sampleSales);
    console.log(`  Seeded ${sampleSales.length} sample in-store sales`);
  } else {
    console.log(`  Sales already exist (${saleCount}), skipping`);
  }

  await mongoose.disconnect();
  console.log("\n  Database seeded successfully!");
  console.log("──────────────────────────────────────");
  console.log("  admin@kartel.com / TestAdmin123!");
  console.log("  staff@kartel.com / TestStaff123!");
  console.log("  customer@kartel.com / TestCustomer123!");
  console.log("──────────────────────────────────────");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
