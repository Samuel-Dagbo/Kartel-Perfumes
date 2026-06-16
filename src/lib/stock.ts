import type { ClientSession } from "mongoose";
import { Product } from "./models/Product";

interface StockItem {
  productId: string;
  quantity: number;
  name: string;
}

export async function decrementStock(items: StockItem[], session: ClientSession) {
  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: item.productId,
        $expr: {
          $gte: [{ $ifNull: ["$stock", 0] }, item.quantity],
        },
      },
      [
        {
          $set: {
            stock: {
              $subtract: [
                { $ifNull: ["$stock", 0] },
                { $ifNull: [item.quantity, 0] },
              ],
            },
          },
        },
      ],
      { session, updatePipeline: true }
    );

    if (result.modifiedCount !== 1) {
      const product = await Product.findById(item.productId).session(session);
      const available = (product?.stock as number | null | undefined) ?? 0;
      throw new Error(
        available <= 0
          ? `Product "${item.name}" is out of stock`
          : `Insufficient stock for "${item.name}". Only ${available} left.`
      );
    }
  }
}

export async function restoreStock(items: StockItem[], session: ClientSession) {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
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
      { session, updatePipeline: true }
    );
  }
}
