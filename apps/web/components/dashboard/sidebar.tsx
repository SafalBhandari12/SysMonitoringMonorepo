"use client";

import clsx from "clsx";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "../ui/toggle-theme";

export default function SideBar() {
  const pathName = usePathname();
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Api", href: "/dashboard/api", icon: Home },
    { name: "Api Groups", href: "/dashboard/apigroups", icon: Home },
    { name: "Api Keys", href: "/dashboard/apikeys", icon: Home },
  ];
  return (
    <aside className="w-64 h-screen border-r">
      <h2>Navigation</h2>
      <nav className="flex flex-col gap-2 p-4">
        {links.map((link) => {
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx("block px-3 py-2 rounded", {
                "bg-slate-300 text-black": pathName === link.href,
              })}
            >
              <link.icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
        <ModeToggle />
      </nav>
    </aside>
  );
}
