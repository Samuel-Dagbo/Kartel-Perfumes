import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";
import { slugify } from "@/lib/utils";
import { requireRole } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { errorFromUnknown, parseProductBody } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    let product;

    if (isObjectId) {
      product = await Product.findOne({
        $or: [{ _id: id }, { slug: id }],
        isActive: true,
      }).lean();
    } else {
      product = await Product.findOne({ slug: id, isActive: true }).lean();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

async function uniqueSlug(name: string, excludeId?: string) {
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = `product-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;
  while (await Product.findOne({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
  return candidate;
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
    if (!checkRateLimit(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Too many product requests. Try again later." }, { status: 429 });
    }

    await requireRole(["admin", "staff"]);

    await connectToDatabase();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = parseProductBody(body, true);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates = parsed.value;
    if (typeof updates.name === "string" && updates.name !== existing.name) {
      updates.slug = await uniqueSlug(updates.name, id);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 30, 60_000)) {
      return NextResponse.json({ error: "Too many product requests. Try again later." }, { status: 429 });
    }

    await requireRole(["admin"]);

    await connectToDatabase();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", errorFromUnknown(error));
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
