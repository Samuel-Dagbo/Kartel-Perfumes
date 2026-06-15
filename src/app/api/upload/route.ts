import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { requireRole } from "@/lib/authz";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const maxSize = 5 * 1024 * 1024;
const maxDimension = 4096;

function detectImageType(buffer: Buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.toString("ascii", 0, 8) === "\u0089PNG\r\n\u001a\n") return "image/png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.toString("ascii", 0, 6) === "GIF87a" || buffer.toString("ascii", 0, 6) === "GIF89a") return "image/gif";
  return null;
}

function readUInt16(buffer: Buffer, offset: number, endian: "big" | "little") {
  return endian === "big" ? buffer.readUInt16BE(offset) : buffer.readUInt16LE(offset);
}

function parseJpegDimensions(buffer: Buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    while (buffer[offset] === 0xff) offset++;
    const marker = buffer[offset++];
    if (marker === 0xda) return null;
    if (marker >= 0xc0 && marker <= 0xc3) {
      const height = buffer.readUInt16BE(offset + 1);
      const width = buffer.readUInt16BE(offset + 3);
      return { width, height };
    }
    if (marker === 0xd8 || marker === 0xd9) return null;
    const length = buffer.readUInt16BE(offset);
    if (!Number.isFinite(length) || length < 2) return null;
    offset += length;
  }
  return null;
}

function parseWebpDimensions(buffer: Buffer) {
  if (buffer.toString("ascii", 12, 16) === "VP8 ") {
    const frameStart = 23;
    return {
      width: buffer.readUInt16LE(frameStart + 6),
      height: buffer.readUInt16LE(frameStart + 8),
    };
  }
  if (buffer.toString("ascii", 12, 16) === "VP8L") {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: ((b1 & 0x3f) << 8) | b0 + 1,
      height: (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) + 1,
    };
  }
  if (buffer.toString("ascii", 12, 16) === "VP8X") {
    return {
      width: (buffer.readUInt32LE(26) & 0xffffff) + 1,
      height: ((buffer.readUInt32LE(29) & 0xffffff) << 8 | buffer[28] >> 4) + 1,
    };
  }
  return null;
}

function parseImageDimensions(buffer: Buffer, type: string) {
  if (type === "image/png") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (type === "image/gif") {
    return { width: readUInt16(buffer, 6, "little"), height: readUInt16(buffer, 8, "little") };
  }
  if (type === "image/jpeg") {
    return parseJpegDimensions(buffer);
  }
  if (type === "image/webp") {
    return parseWebpDimensions(buffer);
  }
  return null;
}

function validateImage(buffer: Buffer, type: string) {
  if (!allowedTypes.includes(type)) {
    return "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed";
  }
  if (buffer.length > maxSize) {
    return "File too large. Maximum size is 5MB";
  }
  const dimensions = parseImageDimensions(buffer, type);
  if (!dimensions || dimensions.width < 1 || dimensions.height < 1 || dimensions.width > maxDimension || dimensions.height > maxDimension) {
    return "Image dimensions are invalid or too large";
  }
  return null;
}

async function generateSignature(timestamp: number, apiSecret: string): Promise<string> {
  const crypto = await import("crypto");
  const toSign = `folder=kartel-perfume&timestamp=${timestamp}${apiSecret}`;
  return crypto.createHash("sha1").update(toSign).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 15, 60_000)) {
      return NextResponse.json({ error: "Too many upload requests. Try again later." }, { status: 429 });
    }

    await requireRole(["admin", "staff"]);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const detectedType = detectImageType(buffer);
    const validationError = validateImage(buffer, detectedType || file.type);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const base64 = buffer.toString("base64");
    const dataUri = `data:${detectedType || file.type};base64,${base64}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp, apiSecret);

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
        signal: AbortSignal.timeout(30_000),
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
