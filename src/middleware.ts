import { NextRequest, NextResponse } from "next/server";

const MAINTENANCE_MODE = process.env.MILES_MAINTENANCE === "true";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Maintenance mode: redirect everything to /maintenance ──
  if (MAINTENANCE_MODE && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }
  // If maintenance is off but someone hits /maintenance, send them home
  if (!MAINTENANCE_MODE && pathname === "/maintenance") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check for session cookie existence (lightweight Edge-compatible check).
  // Actual auth verification happens in API routes via auth().
  const hasSession =
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("authjs.session-token");
  const isLoggedIn = hasSession;

  // Protected routes
  const protectedRoutes = ["/dashboard", "/report", "/team", "/compare"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|studios).*)"],
};
