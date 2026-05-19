import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const { email, amount } = await req.json();

    if (!email || !amount || amount <= 0) {
      return NextResponse.json({ error: "Valid email and amount are required" }, { status: 400 });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: "GHS",
        channels: ["card", "mobile_money", "bank", "ussd"],
        callback_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/orders`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialization failed:", data);
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 400 });
    }

    return NextResponse.json({
      reference: data.data.reference,
      accessCode: data.data.access_code,
      authorizationUrl: data.data.authorization_url,
    });
  } catch (error) {
    console.error("POST /api/paystack/initialize error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
