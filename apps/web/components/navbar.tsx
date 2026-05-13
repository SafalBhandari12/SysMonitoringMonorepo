"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Logo from "./ui/Logo";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isLandingNav =
    !!pathname && (pathname.startsWith("/docs") || pathname === "/pricing" || pathname === "/about");

  const navClass = `flex items-center h-15 text-sm  px-10 gap-8 ${isLandingNav ? "landing-scope" : ""}`;

  return (
    <nav className={navClass}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <Logo />
        <span className="font-medium text-base text-foreground">
          Watchlayer
        </span>
      </Link>

      {/* Nav Links - Centered */}
      <div className="flex items-center gap-8 flex-1 justify-center">
        <Link
          href="/docs"
          className="text-base text-muted-foreground hover:text-foreground transition-colors no-underline"
        >
          Docs
        </Link>
        <Link
          href="/pricing"
          className="text-base text-muted-foreground hover:text-foreground transition-colors no-underline"
        >
          Pricing
        </Link>
      </div>

      {/* Auth Section */}
      <div className="flex items-center gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className="text-sm font-medium px-[18px] py-2 rounded border border-border text-foreground hover:border-foreground transition-all duration-150 no-underline"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium px-[18px] py-2 rounded border border-border text-foreground hover:border-foreground transition-all duration-150 no-underline"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
