import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { AuditLog } from "@/lib/models/AuditLog";
import { requireRole, AuthError } from "@/lib/authz";
import { checkRateLimit, getClientIp, validateCSRF } from "@/lib/request";
import { parseUserRoleUpdateBody } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    if (!checkRateLimit(`${ip}:users-update`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many user updates. Try again later." }, { status: 429 });
    }

    const { session } = await requireRole(["admin"]);

    const body = await req.json();
    const parsed = parseUserRoleUpdateBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    await connectToDatabase();

    if (parsed.value.userId === session.user.id) {
      if (parsed.value.role && parsed.value.role !== "admin") {
        return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 });
      }
      if (parsed.value.isActive === false) {
        return NextResponse.json({ error: "You cannot deactivate yourself" }, { status: 400 });
      }
    }

    if (parsed.value.role && parsed.value.role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      const targetUser = await User.findById(parsed.value.userId).lean();
      if (targetUser?.role === "admin" && adminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 400 });
      }
    }

    if (parsed.value.isActive === false) {
      const targetUser = await User.findById(parsed.value.userId).lean();
      if (targetUser?.role === "admin") {
        const activeAdminCount = await User.countDocuments({ role: "admin", isActive: true });
        if (activeAdminCount <= 1) {
          return NextResponse.json({ error: "Cannot deactivate the last active admin" }, { status: 400 });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      parsed.value.userId,
      {
        ...(parsed.value.role ? { role: parsed.value.role } : {}),
        ...(parsed.value.isActive !== undefined ? { isActive: parsed.value.isActive } : {}),
      },
      { returnDocument: "after" }
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PATCH /api/users error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
