import { connectToDatabase } from "@/lib/mongoose";
import { Product } from "@/lib/models/Product";

const COVER_WIDTH = 900;

const resize = (url: string) => {
  if (!url) return url;
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/w_${COVER_WIDTH},q_auto,f_auto/`);
  }
  if (url.includes("images.unsplash.com") && url.includes("w=800")) {
    return url.replace("w=800", `w=${COVER_WIDTH}`);
  }
  return url;
};

export async function getFeaturedProductImages(limit = 10): Promise<string[]> {
  try {
    await connectToDatabase();
    const docs = await Product.find({ isActive: true })
      .sort({ isFeatured: -1, createdAt: 1 })
      .select("images")
      .lean();

    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of docs as Array<{ images?: string[] }>) {
      for (const raw of d.images ?? []) {
        if (!raw || seen.has(raw)) continue;
        seen.add(raw);
        result.push(resize(raw));
        if (result.length >= limit) return result;
      }
    }
    return result;
  } catch {
    return [];
  }
}
