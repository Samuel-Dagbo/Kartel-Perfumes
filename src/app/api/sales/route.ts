import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { generateSaleNumber } from "@/lib/utils";
import { requireRole, AuthError } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { decrementStock } from "@/lib/stock";
import { TAX_RATE } from "@/lib/constants";
import { errorFromUnknown, parseSaleBody } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 20), 1), 100);

    await connectToDatabase();
    const [sales, total] = await Promise.all([
      Sale.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("items.product", "name images stock")
        .lean(),
      Sale.countDocuments(),
    ]);

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

    return NextResponse.json({ sales: enriched, total, page, limit });
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
    if (!checkRateLimit(`${ip}:sales-create`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many sale requests. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin", "staff"]);
    await connectToDatabase();

    const body = await req.json();
    const parsed = parseSaleBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { items: cartItems, paymentMethod, customerName, customerEmail, notes } = parsed.value;
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
        image: product.images?.[0] || "",
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/sales error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
