import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const isAuthPage = path.startsWith("/sign-in") || path.startsWith("/sign-up");

    if (isAuthPage && token) {
      const role = token.role as string;
      if (role === "admin" || role === "staff") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/dashboard")) {
      if (!token) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(signInUrl);
      }

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
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/sign-in") || path.startsWith("/sign-up")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
