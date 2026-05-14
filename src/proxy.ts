import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isAuthPage = path.startsWith("/sign-in") || path.startsWith("/sign-up");

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (path.startsWith("/dashboard")) {
      if (token?.role === "customer") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      const adminOnlyPaths = ["/dashboard/analytics", "/dashboard/users"];
      if (adminOnlyPaths.some((p) => path.startsWith(p)) && token?.role !== "admin") {
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
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
