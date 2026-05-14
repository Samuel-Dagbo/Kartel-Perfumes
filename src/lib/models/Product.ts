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
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    images: [{ type: String }],
    scentNotes: {
      top: [{ type: String }],
      heart: [{ type: String }],
      base: [{ type: String }],
    },
    concentration: { type: String, required: true },
    volume: { type: Number, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "unisex"],
      default: "unisex",
    },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product =
  models.Product || model<IProduct>("Product", productSchema);
