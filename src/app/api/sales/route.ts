import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { generateSaleNumber } from "@/lib/utils";
import { requireRole } from "@/lib/authz";
import { decrementStock } from "@/lib/stock";
import { TAX_RATE } from "@/lib/constants";
import { errorFromUnknown, parseCartItem } from "@/lib/validation";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (process.env.TRUST_PROXY === "true" && forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return req.headers.get("x-real-ip") || "unknown";
}

function rateLimit(key: string, maxAttempts = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) {
    return false;
  }
  entry.count++;
  return true;
}

function validateCSRF(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

function requiredString(value: unknown, field: string, max: number): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${field} is too long`);
  return trimmed;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .populate("items.product", "name images stock")
      .lean();

    const enriched = sales.map((sale) => {
      const items = ((sale.items as Array<Record<string, unknown>>) || []).map((item) => {
        const product = item.product as Record<string, unknown> | null;
        const images = (product?.images as string[]) ?? [];
        return {
          product: product?._id?.toString() ?? item.product,
          name: item.name as string,
          price: item.price as number,
          quantity: item.quantity as number,
          image: images[0] ?? null,
        };
      });
      return { ...sale, items };
    });

    return NextResponse.json({ sales: enriched });
  } catch (error) {
    console.error("GET /api/sales error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many sale requests. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin", "staff"]);
    await connectToDatabase();

    const body = await req.json();
    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length < 1 || rawItems.length > 50) {
      return NextResponse.json({ error: "Sale must contain 1 to 50 items" }, { status: 400 });
    }

    const parsedItems = rawItems.map((item, index) => {
      const fields = item && typeof item === "object" ? item as Record<string, unknown> : {};
      return parseCartItem({ productId: fields.product, quantity: fields.quantity }, index);
    });
    const invalidItem = parsedItems.find((item) => !item.ok);
    if (invalidItem) {
      return NextResponse.json({ error: invalidItem.error }, { status: 400 });
    }

    const paymentMethod = requiredString(body.paymentMethod, "Payment method", 20);
    if (!paymentMethod || !["cash", "card", "transfer"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const customerName = requiredString(body.customerName, "Customer name", 160);
    const customerEmail = requiredString(body.customerEmail, "Customer email", 254);
    const notes = requiredString(body.notes, "Notes", 1000);

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
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || "",
      });
      subtotal += product.price * item.quantity;
    }

    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    const dbSession = await mongoose.startSession();

    try {
      dbSession.startTransaction();

      await decrementStock(
        resolvedItems.map((item) => ({
          productId: item.product.toString(),
          quantity: item.quantity,
          name: item.name,
        })),
        dbSession
      );

      const sale = await Sale.create(
        [{
          saleNumber: generateSaleNumber(),
          items: resolvedItems,
          subtotal,
          tax,
          total,
          paymentMethod,
          customerName,
          customerEmail,
          notes,
          salesPerson: session.user.name || session.user.email || "Staff",
        }],
        { session: dbSession }
      );

      await dbSession.commitTransaction();

      return NextResponse.json(sale, { status: 201 });
    } catch (error) {
      await dbSession.abortTransaction();
      return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create sale" }, { status: 409 });
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("POST /api/sales error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
