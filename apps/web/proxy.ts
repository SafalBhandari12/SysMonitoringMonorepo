import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { hashKey } from "./app/utils/hash";
import { ipAddress } from "@vercel/functions";
import { createRateLimit, enforceRateLimit } from "./app/utils/rate-limit";

const rateLimitPing = createRateLimit("rl:ping", 1, "5m");
const normalRateLimit = createRateLimit("rl:normal", 1000, "1h");

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  console.log("Proxy middleware invoked for path:", pathname);
  const ip = ipAddress(req) ?? "127.0.0.1";

  if (pathname.startsWith("/api/ping")) {
    const apiKey = req.headers.get("x-api-key");
    const rateLimitResult = await enforceRateLimit(rateLimitPing, ip);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "API key missing" },
        { status: 401 },
      );
    }
    console.log("Received API key:", apiKey);
    const hashedKey = hashKey(apiKey);
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        key: hashedKey,
      },
      select: {
        id: true,
        userId: true,
      },
    });
    console.log("API key record found:", apiKeyRecord);
    if (!apiKeyRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 },
      );
    }
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-authenticated-user-id", apiKeyRecord?.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const rateLimitResult = await enforceRateLimit(normalRateLimit, ip);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/ping/:path*",
    "/api/private/:path*",
    "/onboarding/:path*",
  ],
};
