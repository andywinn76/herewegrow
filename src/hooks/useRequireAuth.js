"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";

export default function useRequireAuth() {
  const { user, userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      setTimeout(() => router.push("/login"), 0);
    }
  }, [user, userLoading, router]);

  return { user, userLoading };
}
