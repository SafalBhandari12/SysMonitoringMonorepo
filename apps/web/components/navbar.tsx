"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center h-15 text-sm  px-10 gap-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="inline-flex items-center justify-center w-5 h-5 border-2 border-black rounded-full relative">
          <span className="w-1.5 h-1.5 bg-black rounded-full absolute"></span>
        </span>
        <span className="font-medium text-base text-black">Watchlayer</span>
      </Link>

      {/* Nav Links - Centered */}
      <div className="flex items-center gap-8 flex-1 justify-center">
        <Link
          href="/about"
          className="text-base text-gray-600 hover:text-black transition-colors no-underline"
        >
          About
        </Link>
        <Link
          href="/docs"
          className="text-base text-gray-600 hover:text-black transition-colors no-underline"
        >
          Docs
        </Link>
        <Link
          href="/pricing"
          className="text-base text-gray-600 hover:text-black transition-colors no-underline"
        >
          Pricing
        </Link>
      </div>

      {/* Auth Section */}
      <div className="flex items-center gap-4">
        {session ? (
          <Link
            href="/dashboard"
            className="text-sm font-medium px-[18px] py-2 rounded border border-gray-300 text-gray-600 hover:border-gray-600 hover:text-black transition-all duration-150 no-underline"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium px-[18px] py-2 rounded border border-gray-300 text-gray-600 hover:border-gray-600 hover:text-black transition-all duration-150 no-underline"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
