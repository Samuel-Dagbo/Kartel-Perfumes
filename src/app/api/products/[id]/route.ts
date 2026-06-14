import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";
import { slugify } from "@/lib/utils";
import mongoose from "mongoose";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "Product name cannot be empty" }, { status: 400 });
      }
      if (name.length > 120) {
        return NextResponse.json({ error: "Product name is too long" }, { status: 400 });
      }
      updates.name = name;
      if (name !== existing.name) {
        let baseSlug = slugify(name);
        if (!baseSlug) baseSlug = `product-${Date.now()}`;
        let candidate = baseSlug;
        let suffix = 1;
        // Ensure slug uniqueness
        while (await Product.findOne({ slug: candidate, _id: { $ne: existing._id } })) {
          suffix += 1;
          candidate = `${baseSlug}-${suffix}`;
        }
        updates.slug = candidate;
      }
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (Number.isNaN(price) || price < 0) {
        return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 });
      }
      updates.price = price;
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        return NextResponse.json({ error: "Stock must be a non-negative integer" }, { status: 400 });
      }
      updates.stock = stock;
    }

    if (Array.isArray(body.images)) {
      updates.images = body.images.filter((x): x is string => typeof x === "string" && x.length > 0);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();

    return NextResponse.json({ product });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
