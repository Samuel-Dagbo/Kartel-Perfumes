import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { parseUserRoleUpdateBody } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const users = await User.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!validateCSRF(req)) {
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 20, 60_000)) {
      return NextResponse.json({ error: "Too many user updates. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin"]);

    const body = await req.json();
    const parsed = parseUserRoleUpdateBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findByIdAndUpdate(
      parsed.value.userId,
      {
        ...(parsed.value.role ? { role: parsed.value.role } : {}),
        ...(parsed.value.isActive !== undefined ? { isActive: parsed.value.isActive } : {}),
      },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await AuditLog.create({
      actor: session.user.id,
      actorName: session.user.name || "Admin",
      actorEmail: session.user.email || "",
      action: "user.update",
      targetType: "User",
      targetId: user._id.toString(),
      metadata: parsed.value,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PATCH /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
