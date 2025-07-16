"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on login page
  const hideHeaderRoutes = ["/login"];
  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  if (shouldHideHeader) return null;

  return (
    <Header>
      <Navbar />
    </Header>
  );
}
