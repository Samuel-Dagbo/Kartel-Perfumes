import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { Order } from "@/lib/models/Order";
import { Product } from "@/lib/models/Product";
import { calculateTotals } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { orderConfirmationTemplate } from "@/lib/email-templates";
import { verifyPaystackTransaction, refundPaystackTransaction } from "@/lib/paystack";
import { decrementStock } from "@/lib/stock";
import { errorFromUnknown, parseCheckoutBody } from "@/lib/validation";

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 6, 60_000)) {
      return NextResponse.json({ error: "Too many checkout requests. Try again later." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = parseCheckoutBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { items: cartItems, customer, shippingAddress, paymentMethod, paymentReference } = parsed.value;

    if (customer.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "Customer email must match your account email" }, { status: 403 });
    }

    const products = await Product.find({ _id: { $in: cartItems.map((item: CartItem) => item.productId) } }).lean();
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const resolvedItems: CheckoutItem[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "One or more products are not available" }, { status: 404 });
      }
      if (!product.isActive) {
        return NextResponse.json({ error: `Product "${product.name}" is not available` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} left.` },
          { status: 409 }
        );
      }
      resolvedItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });
      subtotal += product.price * item.quantity;
    }

    const { tax, shipping, total } = calculateTotals(subtotal);

    if (paymentMethod === "paystack" && !paymentReference) {
      return NextResponse.json({ error: "Payment reference is required for online payment" }, { status: 400 });
    }

    if (paymentMethod === "paystack" && paymentReference) {
      const existingOrder = await Order.findOne({
        paymentReference,
        "customer.email": customer.email,
      }).lean();

      if (existingOrder) {
        return NextResponse.json({ order: existingOrder, emailSent: false });
      }

      const verification = await verifyPaystackTransaction(paymentReference);
      if (!verification.verified) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
      if (verification.email.toLowerCase() !== customer.email.toLowerCase()) {
        return NextResponse.json({ error: "Payment email mismatch" }, { status: 400 });
      }
      if (Math.abs(verification.amount - total) > 0.01) {
        return NextResponse.json({ error: "Payment amount mismatch — please contact support" }, { status: 400 });
      }
    }

    const dbSession = await mongoose.startSession();
    let order;

    try {
      dbSession.startTransaction();

      const stockItems = resolvedItems.map<Parameters<typeof decrementStock>[0][number]>((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.name,
      }));

      await decrementStock(stockItems, dbSession);

      order = (await Order.create(
        [{
          orderNumber: `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          items: resolvedItems.map<OrderItem>((item) => ({
            product: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal,
          tax,
          shipping,
          total,
          status: paymentMethod === "cod" ? "pending" : "confirmed",
          paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
          paymentMethod: paymentMethod === "cod" ? "cash_on_delivery" : "card",
          paymentReference: paymentMethod === "cod" ? `COD-${Date.now().toString(36).toUpperCase()}` : paymentReference,
          paymentGateway: paymentMethod,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
          },
          shippingAddress,
        }],
        { session: dbSession }
      ))[0];

      await dbSession.commitTransaction();
    } catch (error) {
      await dbSession.abortTransaction();

      if (paymentMethod === "paystack" && paymentReference) {
        await refundPaystackTransaction(paymentReference, total);
      }

      const message = error instanceof Error ? error.message : "Checkout failed";
      return NextResponse.json({ error: message, refundRequested: paymentMethod === "paystack" }, { status: 409 });
    } finally {
      dbSession.endSession();
    }

    let emailSent = false;
    try {
      await sendEmail({
        to: { email: customer.email, name: customer.name },
        subject: `Order Confirmation — ${order.orderNumber}`,
        html: orderConfirmationTemplate({
          customerName: customer.name,
          orderNumber: order.orderNumber,
          items: order.items.map((item: OrderItem) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
        }),
      });
      emailSent = true;
    } catch (error) {
      console.error("Order email failed:", error);
    }

    return NextResponse.json({ order, emailSent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/checkout error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
