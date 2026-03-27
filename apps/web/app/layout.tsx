import type { Metadata } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import "./globals.css";

const terminal = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-terminal",
  weight: ["400", "500", "600"],
});

const display = VT323({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

export const metadata: Metadata = {
  title: "StatusGuard | Terminal Monitoring",
  description:
    "DNS-verified domain and API uptime monitoring with terminal-grade operational visibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${terminal.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
