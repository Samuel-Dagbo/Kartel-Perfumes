"use server";

import { connectToDatabase } from "./mongoose";
import { Product } from "./models/Product";
import { User } from "./models/User";
import { Order } from "./models/Order";
import { Sale } from "./models/Sale";
import { slugify, generateOrderNumber, generateSaleNumber } from "./utils";
import { products as productData, testUsers as userData } from "./product-data";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  await connectToDatabase();

  const results: string[] = [];

  const productCount = await Product.countDocuments();
  if (productCount !== productData.length) {
    if (productCount > 0) {
      await Product.deleteMany({});
      results.push(`Removed ${productCount} old products`);
    }
    const productsWithSlugs = productData.map((p) => ({
      ...p,
      slug: slugify(p.name),
    }));
    await Product.insertMany(productsWithSlugs);
    results.push(`Seeded ${productData.length} products`);
  } else {
    results.push(`Products already seeded (${productCount} existing)`);
  }

  const oldUsers = await User.find({ email: /@maisonnoire\.com$/ }).lean();
  for (const old of oldUsers) {
    const newEmail = old.email.replace("@maisonnoire.com", "@kartel.com");
    await User.updateOne({ _id: old._id }, { $set: { email: newEmail } });
  }
  if (oldUsers.length > 0) {
    results.push(`Migrated ${oldUsers.length} user emails to @kartel.com`);
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
    results.push(`Seeded ${userData.length} test users`);
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
        const needsUpdate =
          existing.name !== u.name ||
          existing.role !== u.role;
        if (needsUpdate) {
          await User.updateOne({ _id: existing._id }, {
            name: u.name,
            role: u.role,
            phone: u.phone,
          });
          updatedCount++;
        }
      }
    }
    if (updatedCount > 0) {
      results.push(`Updated ${updatedCount} test users`);
    }
    results.push(`Users found (${userCount} existing)`);
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    const allProducts = await Product.find().lean();
    if (allProducts.length > 0) {
      const sampleOrders = [
        {
          orderNumber: generateOrderNumber(),
          items: [
            { product: allProducts[0]._id, name: allProducts[0].name, price: allProducts[0].price, quantity: 2, image: allProducts[0].images[0] },
            { product: allProducts[3]._id, name: allProducts[3].name, price: allProducts[3].price, quantity: 1, image: allProducts[3].images[0] },
          ],
          subtotal: Math.round((allProducts[0].price * 2 + allProducts[3].price) * 100) / 100,
          tax: Math.round((allProducts[0].price * 2 + allProducts[3].price) * 0.08 * 100) / 100,
          shipping: 0, total: 0,
          status: "delivered", paymentStatus: "paid", paymentMethod: "card",
          customer: { name: "Isabelle Moreau", email: "customer@kartel.com" },
          shippingAddress: { line1: "42 Rue de la Paix", city: "New York", state: "NY", zip: "10012", country: "US" },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          orderNumber: generateOrderNumber(),
          items: [{ product: allProducts[2]._id, name: allProducts[2].name, price: allProducts[2].price, quantity: 1, image: allProducts[2].images[0] }],
          subtotal: allProducts[2].price,
          tax: Math.round(allProducts[2].price * 0.08 * 100) / 100,
          shipping: 15, total: 0,
          status: "processing", paymentStatus: "paid", paymentMethod: "card",
          customer: { name: "James Walker", email: "james@example.com" },
          shippingAddress: { line1: "88 Bedford Ave", city: "Brooklyn", state: "NY", zip: "11211", country: "US" },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          orderNumber: generateOrderNumber(),
          items: [
            { product: allProducts[4]._id, name: allProducts[4].name, price: allProducts[4].price, quantity: 1, image: allProducts[4].images[0] },
            { product: allProducts[6]._id, name: allProducts[6].name, price: allProducts[6].price, quantity: 1, image: allProducts[6].images[0] },
          ],
          subtotal: Math.round((allProducts[4].price + allProducts[6].price) * 100) / 100,
          tax: Math.round((allProducts[4].price + allProducts[6].price) * 0.08 * 100) / 100,
          shipping: 0, total: 0,
          status: "pending", paymentStatus: "pending", paymentMethod: "card",
          customer: { name: "Sofia Reyes", email: "sofia@example.com" },
          shippingAddress: { line1: "15 Washington Sq", city: "New York", state: "NY", zip: "10003", country: "US" },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      const ordersToInsert = sampleOrders.map((o) => ({ ...o, total: Math.round((o.subtotal + o.tax + o.shipping) * 100) / 100 }));
      await Order.insertMany(ordersToInsert);
      results.push(`Seeded ${sampleOrders.length} sample orders`);
    }
  } else {
    results.push(`Orders already seeded (${orderCount} existing)`);
  }

  const saleCount = await Sale.countDocuments();
  if (saleCount === 0) {
    const allProducts = await Product.find().lean();
    if (allProducts.length > 0) {
      const sampleSales = [
        {
          saleNumber: generateSaleNumber(),
          items: [{ product: allProducts[1]._id, name: allProducts[1].name, price: allProducts[1].price, quantity: 1 }],
          subtotal: allProducts[1].price, tax: Math.round(allProducts[1].price * 0.08 * 100) / 100,
          total: Math.round(allProducts[1].price * 1.08 * 100) / 100,
          paymentMethod: "card", customerName: "Walk-in Customer", salesPerson: "Marcus Chen",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          saleNumber: generateSaleNumber(),
          items: [
            { product: allProducts[5]._id, name: allProducts[5].name, price: allProducts[5].price, quantity: 2 },
            { product: allProducts[7]._id, name: allProducts[7].name, price: allProducts[7].price, quantity: 1 },
          ],
          subtotal: Math.round((allProducts[5].price * 2 + allProducts[7].price) * 100) / 100,
          tax: Math.round((allProducts[5].price * 2 + allProducts[7].price) * 0.08 * 100) / 100,
          total: Math.round((allProducts[5].price * 2 + allProducts[7].price) * 1.08 * 100) / 100,
          paymentMethod: "cash", customerName: "Elena Vogt", salesPerson: "Helene Voss",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      await Sale.insertMany(sampleSales);
      results.push(`Seeded ${sampleSales.length} sample in-store sales`);
    }
  } else {
    results.push(`Sales already seeded (${saleCount} existing)`);
  }

  return {
    message: results.join(" | "),
    collections: {
      products: productCount || productData.length,
      users: userCount || userData.length,
    },
  };
}

export async function seedProducts() {
  await connectToDatabase();
  const count = await Product.countDocuments();
  if (count > 0) return { message: "Database already seeded", count };
  const productsWithSlugs = productData.map((p) => ({ ...p, slug: slugify(p.name) }));
  await Product.insertMany(productsWithSlugs);
  return { message: "Products seeded", count: productData.length };
}
