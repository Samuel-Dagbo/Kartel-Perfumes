import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const slug = slugify(body.name);

    const existing = await Product.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 });
    }

    const product = await Product.create({ ...body, slug });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
