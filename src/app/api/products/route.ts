import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";
import { slugify } from "@/lib/utils";
import { requireRole, AuthError } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { errorFromUnknown, parseProductBody } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 24), 1), 100);

    await connectToDatabase();

    const query = session && (session.user.role === "admin" || session.user.role === "staff") && includeAll
      ? {}
      : { isActive: true };

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(`${ip}:products-create`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many product requests. Try again later." }, { status: 429 });
    }

    await requireRole(["admin", "staff"]);

    await connectToDatabase();
    const body = await req.json();
    const parsed = parseProductBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const slug = slugify(parsed.value.name as string);
    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 });
    }

    const product = await Product.create({ ...parsed.value, slug });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/products error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
