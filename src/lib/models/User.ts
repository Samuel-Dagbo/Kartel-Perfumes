import { Schema, model, models } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "customer" | "staff";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
    },
    avatar: { type: String },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", userSchema);
