import { auth } from "@/auth";
import { NextResponse } from "next/server";


export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  console.log(req.auth?.user);
  console.log(
    `Proxy middleware: pathname=${pathname}, isLoggedIn=${isLoggedIn}`,
  );

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  if(req.auth?.user?.onboarded===false && !pathname.startsWith("/onboarding")){
    return NextResponse.redirect(new URL("/onboarding", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/private/:path*", "/onboarding/:path*"],
};
