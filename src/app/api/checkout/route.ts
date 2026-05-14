import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const shipping = subtotal > 200 ? 0 : 15;
    const total = subtotal + tax + shipping;

    const orderItems = items.map(
      (item: { productId: string; name: string; price: number; quantity: number; image: string }) => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      })
    );

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      status: "pending",
      paymentStatus: "paid",
      paymentMethod: "card",
      customer: customer || {
        name: "Guest Customer",
        email: "guest@example.com",
      },
      shippingAddress: {
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
      },
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
