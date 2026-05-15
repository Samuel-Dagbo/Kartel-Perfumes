import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "staff") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp, cloudName, apiSecret);

    const uploadFormData = new FormData();
    uploadFormData.append("file", dataUri);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    uploadFormData.append("folder", "kartel-perfume");

    const cloudResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    if (!cloudResponse.ok) {
      const error = await cloudResponse.text();
      console.error("Cloudinary upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const result = await cloudResponse.json();

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function generateSignature(timestamp: number, cloudName: string, apiSecret: string): Promise<string> {
  const crypto = await import("crypto");
  const toSign = `folder=kartel-perfume&timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(toSign).digest("hex");
}