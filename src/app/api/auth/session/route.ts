import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function GET() {
  try {
    const headersList = await headers();
    const token = await getToken({ req: { headers: headersList } as NextRequest, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        image: token.picture,
      },
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json({ user: null });
  }
}