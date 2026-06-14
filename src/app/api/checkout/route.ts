import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { generateOrderNumber } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates";

async function verifyPaystack(reference: string): Promise<{ verified: boolean; amount: number; email: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { verified: false, amount: 0, email: "" };

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const data = await res.json();

  if (!data.status || data.data.status !== "success") {
    return { verified: false, amount: 0, email: "" };
  }

  return {
    verified: true,
    amount: data.data.amount / 100,
    email: data.data.customer.email,
  };
}

interface CheckoutBody {
  items?: Array<{ productId: string; name: string; price: number; quantity: number; image: string }>;
  customer?: { name: string; email: string; phone?: string };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  paymentMethod?: "paystack" | "cod";
  paymentReference?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await connectToDatabase();
    const body = (await req.json()) as CheckoutBody;
    const { items, customer, shippingAddress, paymentMethod = "paystack", paymentReference } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customer?.name || !customer?.email) {
      return NextResponse.json({ error: "Customer name and email are required" }, { status: 400 });
    }

    if (customer.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "Customer email must match your account email" }, { status: 403 });
    }

    if (!shippingAddress?.line1 || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    const tax = Number((subtotal * 0.08).toFixed(2));
    const shipping = subtotal > 2000 ? 0 : 15;
    const total = Number((subtotal + tax + shipping).toFixed(2));

    let paymentStatus: "pending" | "paid" = "pending";
    let verifiedReference: string | undefined = paymentReference;
    let gateway: "paystack" | "cod" = paymentMethod;

    if (paymentMethod === "paystack") {
      if (!paymentReference) {
        return NextResponse.json({ error: "Payment reference is required for online payment" }, { status: 400 });
      }
      const verification = await verifyPaystack(paymentReference);
      if (!verification.verified) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
      if (verification.email.toLowerCase() !== customer.email.toLowerCase()) {
        return NextResponse.json({ error: "Payment email mismatch" }, { status: 400 });
      }
      if (Math.abs(verification.amount - total) > 1) {
        return NextResponse.json({ error: "Payment amount mismatch — please contact support" }, { status: 400 });
      }
      paymentStatus = "paid";
    } else if (paymentMethod === "cod") {
      verifiedReference = `COD-${Date.now().toString(36).toUpperCase()}`;
      gateway = "cod";
    } else {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product "${item.name}" not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` },
          { status: 400 }
        );
      }
    }

    const orderItems = items.map((item) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || "",
    }));

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      status: paymentMethod === "cod" ? "pending" : "confirmed",
      paymentStatus,
      paymentMethod: paymentMethod === "cod" ? "cash_on_delivery" : "card",
      paymentReference: verifiedReference,
      paymentGateway: gateway,
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
        country: shippingAddress.country || "GH",
      },
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    sendEmail({
      to: { email: customer.email, name: customer.name },
      subject: `Order Confirmation — ${order.orderNumber}`,
      html: orderConfirmationTemplate({
        customerName: customer.name,
        orderNumber: order.orderNumber,
        items: orderItems.map((i) => ({
          name: i.name, quantity: i.quantity, price: i.price,
        })),
        total,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      }),
    }).catch((err) => console.error("Order email failed:", err));

    return NextResponse.json({ order, emailSent: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
