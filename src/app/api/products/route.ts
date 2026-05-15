import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";
    
    await connectToDatabase();
    
    let products;
    if (session && (session.user.role === "admin" || session.user.role === "staff") && includeAll) {
      products = await Product.find().sort({ createdAt: -1 }).lean();
    } else {
      products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
