import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { verifyPaystackTransaction } from "@/lib/paystack";

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(body).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body || "{}");
    const data = event.data || {};
    const reference = String(data.reference || "");

    if (!reference) {
      return NextResponse.json({ received: true });
    }

    await connectToDatabase();
    const order = await Order.findOne({ paymentReference: reference });

    if (order?.paymentStatus === "paid") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    const verification = await verifyPaystackTransaction(reference);

    if (!verification.verified) {
      if (order) {
        order.paymentStatus = "failed";
        if (order.status === "confirmed") order.status = "pending";
        await order.save();
      }
      return NextResponse.json({ received: true });
    }

    if (!order) {
      return NextResponse.json({ received: true, created: false });
    }

    if (Math.abs(verification.amount - order.total) > 0.01) {
      order.paymentStatus = "failed";
      await order.save();
      return NextResponse.json({ received: true, amountMismatch: true });
    }

    order.paymentStatus = "paid";
    order.paymentGateway = "paystack";
    if (order.status === "pending") order.status = "confirmed";
    await order.save();

    return NextResponse.json({ received: true, orderId: order.orderNumber });
  } catch (error) {
    console.error("POST /api/paystack/webhook error:", error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
