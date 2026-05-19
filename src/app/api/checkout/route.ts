import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { generateOrderNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, customer, shippingAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 });
    }

    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const tax = Number((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 200 ? 0 : 15;
    const total = Number((subtotal + tax + shipping).toFixed(2));

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
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
      },
      shippingAddress: {
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country || "US",
      },
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    sendEmail({
      to: { email: customer.email, name: customer.name },
      subject: `Order Confirmation — ${order.orderNumber}`,
      html: orderConfirmationTemplate({
        customerName: customer.name,
        orderNumber: order.orderNumber,
        items: orderItems.map((i: { name: string; quantity: number; price: number }) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total,
      }),
    }).catch((err) => console.error("Order email failed:", err));

    return NextResponse.json({ order, emailSent: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
