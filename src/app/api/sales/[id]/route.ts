import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";

export async function DELETE(
  _req: Request,
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

    const { id } = await params;
    await connectToDatabase();

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await Sale.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
