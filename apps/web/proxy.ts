import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { createRateLimit, enforceRateLimit } from "./app/utils/rate-limit";

const rateLimitPing = createRateLimit("rl:ping", 1, "5m");
const normalRateLimit = createRateLimit("rl:normal", 1000, "1h");

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const ip = ipAddress(req) ?? "127.0.0.1";

  if (pathname.startsWith("/api/ping")) {
    const rateLimitResult = await enforceRateLimit(rateLimitPing, ip);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    return NextResponse.next();
  }

  const rateLimitResult = await enforceRateLimit(normalRateLimit, ip);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  const isOnboarded = req.auth?.user?.onboarded;
  
  if (!isOnboarded && !pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }
  
  if (isOnboarded && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/api/ping/:path*",
    "/api/private/:path*",
  ],
};
