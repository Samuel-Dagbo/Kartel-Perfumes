import { Schema, model, models } from "mongoose";

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  scentNotes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  concentration: string;
  volume: number;
  gender: "male" | "female" | "unisex";
  brand: string;
  category: string;
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0, max: 10000000 },
    originalPrice: { type: Number, min: 0, max: 10000000 },
    images: [{ type: String, maxlength: 2048 }],
    scentNotes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }],
    },
    concentration: { type: String, required: true, maxlength: 80 },
    volume: { type: Number, required: true, min: 1, max: 1000 },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },
    brand: { type: String, required: true, maxlength: 120 },
    category: { type: String, required: true, maxlength: 120 },
    stock: { type: Number, default: 0, min: 0, max: 100000 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

export const Product =
  models.Product || model<IProduct>("Product", productSchema);
