import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

type UserRole = "admin" | "staff" | "customer";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireSession();
  const role = session.user.role as UserRole;
  if (!allowedRoles.includes(role)) {
    throw new Error("Forbidden");
  }
  return { session, role };
}

export function isAllowedRole(role: unknown, allowedRoles: UserRole[]) {
  return typeof role === "string" && allowedRoles.includes(role as UserRole);
}
