import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Product } from "@/lib/models/Product";
import { calculateTotals } from "@/lib/constants";
import { initializePaystackTransaction } from "@/lib/paystack";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { errorFromUnknown, parseCartItem } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(`${ip}:paystack-init`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many payment requests. Try again later." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json({ error: "Cart must contain 1 to 50 items" }, { status: 400 });
    }

    const parsedItems = rawItems.map((item, index) => {
      const fields = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return parseCartItem({ productId: fields.productId, quantity: fields.quantity }, index);
    });
    const invalidItem = parsedItems.find((item) => !item.ok);
    if (invalidItem) {
      return NextResponse.json({ error: invalidItem.error }, { status: 400 });
    }

    const cartItems = parsedItems.map((item) => (item as { ok: true; value: { productId: string; quantity: number } }).value);
    const products = await Product.find({ _id: { $in: cartItems.map((item) => item.productId) } }).lean();
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const resolvedItems = [];
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
        image: product.images?.[0] || "",
      });
      subtotal += product.price * item.quantity;
    }

    const totals = calculateTotals(subtotal);
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/order/complete?ref={{reference}}`;

    let payment;
    try {
      payment = await initializePaystackTransaction({
        email: session.user.email,
        amount: totals.total,
        callbackUrl,
        metadata: {
          cart: resolvedItems,
          totals,
          userId: session.user.id,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment provider error";
      const isConfigIssue = msg.includes("not configured") || msg.includes("Invalid key");
      return NextResponse.json({ error: msg }, { status: isConfigIssue ? 503 : 500 });
    }

    return NextResponse.json({
      authorizationUrl: payment.authorizationUrl,
      accessCode: payment.accessCode,
      reference: payment.reference,
      amount: totals.total,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      items: resolvedItems,
    });
  } catch (error) {
    console.error("POST /api/paystack/initialize error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
