import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { generateSaleNumber } from "@/lib/utils";

export async function GET() {
  try {
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
    await connectToDatabase();
    const body = await req.json();

    for (const item of body.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    const sale = await Sale.create({
      ...body,
      saleNumber: generateSaleNumber(),
    });

    for (const item of body.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales error:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
