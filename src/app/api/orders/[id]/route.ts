import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { connectToDatabase } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import { parseOrderStatusBody } from "@/lib/validation";

const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const allowedTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findOne({ orderNumber: id }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      session.user.role !== "admin" &&
      session.user.role !== "staff" &&
      order.customer.email !== session.user.email
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 20, 60_000)) {
      return NextResponse.json({ error: "Too many order updates. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin", "staff"]);

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const parsed = parseOrderStatusBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const nextStatus = parsed.value.status as (typeof allowedStatuses)[number];
    if (!allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    const order = await Order.findOne({ orderNumber: id });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === nextStatus) {
      return NextResponse.json({ order });
    }

    if (!allowedTransitions[String(order.status)]?.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid order status transition" }, { status: 400 });
    }

    const previousStatus = order.status;
    order.status = nextStatus;
    await order.save();

    await AuditLog.create({
      actor: session.user.id,
      actorName: session.user.name || "Staff",
      actorEmail: session.user.email || "",
      action: "order.status.update",
      targetType: "Order",
      targetId: order.orderNumber,
      metadata: { previousStatus, nextStatus },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
