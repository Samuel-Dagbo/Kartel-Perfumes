import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let orders;
    if (session.user.role === "admin" || session.user.role === "staff") {
      orders = await Order.find().sort({ createdAt: -1 }).lean();
    } else {
      orders = await Order.find({ "customer.email": session.user.email }).sort({ createdAt: -1 }).lean();
    }
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
