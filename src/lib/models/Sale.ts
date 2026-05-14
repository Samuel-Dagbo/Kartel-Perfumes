import mongoose, { Schema, model, models } from "mongoose";

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ISale {
  _id: string;
  saleNumber: string;
  items: ISaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer";
  customerName?: string;
  customerEmail?: string;
  salesPerson: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const saleSchema = new Schema<ISale>(
  {
    saleNumber: { type: String, required: true, unique: true },
    items: [saleItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      required: true,
    },
    customerName: { type: String },
    customerEmail: { type: String },
    salesPerson: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Sale = models.Sale || model<ISale>("Sale", saleSchema);
