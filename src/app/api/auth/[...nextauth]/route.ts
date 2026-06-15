import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";

const handler = NextAuth(authOptions);

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  if (!validateCSRF(req)) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip, 8, 60_000)) {
    return Response.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
  }

  return handler(req);
}
