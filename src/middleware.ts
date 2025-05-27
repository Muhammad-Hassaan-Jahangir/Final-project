import { NextResponse, NextRequest } from "next/server";

// Helper to decode JWT payload (NOT secure for critical verification!)
function getUserRoleFromToken(token: string): string | null {
  try {
    const base64Payload = token.split(".")[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload.role || null;
  } catch (error) {
    console.error("Token decode error", error);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/user", "/forgotPassword"];
  const isPublicPath = publicPaths.includes(path);

  if (isPublicPath && token) {
    const role = getUserRoleFromToken(token);
    if (!role) return NextResponse.redirect(new URL("/login", request.url));

    const redirectPath =
      role === "freelancer"
        ? "/freelancer/dashboard"
        : role === "client"
        ? "/client/dashboard"
        : "/";

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    const role = getUserRoleFromToken(token);
    if (!role) return NextResponse.redirect(new URL("/login", request.url));

    if (path.startsWith("/client") && role !== "client") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/freelancer") && role !== "freelancer") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/user", // replaced /signup
    "/client/:path*",
    "/freelancer/:path*",
    "/profile/:path*",
  ],
};
