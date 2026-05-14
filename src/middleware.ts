import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/dashboard")) {
      if (!token) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(signInUrl);
      }

      if (path === "/dashboard" || path === "/dashboard/") {
        return NextResponse.next();
      }

      const adminOnlyPaths = [
        "/dashboard/analytics",
        "/dashboard/users",
      ];

      if (adminOnlyPaths.some(p => path.startsWith(p)) && token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};