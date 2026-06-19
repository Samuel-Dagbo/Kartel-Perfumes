import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { Sale } from "@/lib/models/Sale";
import { Product } from "@/lib/models/Product";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole, AuthError } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(`${ip}:sales-delete`, 10, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin"]);

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

      const saleSnapshot = {
        saleNumber: sale.saleNumber,
        items: sale.items.map((item: { product: unknown; quantity: number }) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        total: sale.total,
      };

      for (const item of sale.items) {
        await Product.updateOne(
          { _id: item.product },
          [
            {
              $set: {
                stock: {
                  $add: [
                    { $ifNull: ["$stock", 0] },
                    { $ifNull: [item.quantity, 0] },
                  ],
                },
              },
            },
          ],
          { session: dbSession, updatePipeline: true }
        );
      }

      await Sale.findByIdAndDelete(id, { session: dbSession });
      await dbSession.commitTransaction();

      if (saleSnapshot.items.length > 0) {
        await AuditLog.create({
          actor: session.user.id,
          actorName: session.user.name || "Admin",
          actorEmail: session.user.email || "",
          action: "sale.delete",
          targetType: "Sale",
          targetId: saleSnapshot.saleNumber,
          metadata: { restoredStockItems: saleSnapshot.items.length, total: saleSnapshot.total },
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      await dbSession.abortTransaction();
      console.error("DELETE /api/sales/[id] transaction error:", error);
      return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE /api/sales/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete sale" }, { status: 500 });
  }
}
