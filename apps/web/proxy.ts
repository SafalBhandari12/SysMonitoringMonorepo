import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { hashKey } from "./app/utils/hash";

export const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  console.log("Proxy middleware invoked for path:", pathname);

  if (pathname.startsWith("/api/ping")) {
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "API key missing" },
        { status: 401 },
      );
    }
    console.log("Received API key:", apiKey);
    const hashedKey = hashKey(apiKey);
    const apiKeyRecord = await prisma.apiKey.findFirst({
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

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/signup", req.nextUrl.origin));
  }

  if (
    req.auth?.user?.onboarded === false &&
    !pathname.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
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
