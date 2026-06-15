import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { requireRole } from "@/lib/authz";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin"]);

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid sale id" }, { status: 400 });
    }

    await connectToDatabase();

    const dbSession = await mongoose.startSession();
    try {
      dbSession.startTransaction();

      const sale = await Sale.findById(id).session(dbSession);
      if (!sale) {
        await dbSession.abortTransaction();
        return NextResponse.json({ error: "Sale not found" }, { status: 404 });
      }

      for (const item of sale.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session: dbSession }
        );
      }

      await Sale.findByIdAndDelete(id, { session: dbSession });
      await dbSession.commitTransaction();

      return NextResponse.json({ success: true });
    } catch {
      await dbSession.abortTransaction();
      return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("DELETE /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
