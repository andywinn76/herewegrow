// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Account", path: "/account" },
    { name: "Setup", path: "/setup" },
  ];

  return (
    <nav className="w-full px-4 py-1 flex items-center space-x-5">
      {navItems.map(({ name, path }) => (
        <Link
          key={path}
          href={path}
          className={`font-medium hover:text-indigo-600 transition ${
            pathname === path ? "text-indigo-600" : "text-gray-700"
          }`}
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
