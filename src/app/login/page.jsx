"use client";
import { useEffect } from "react";
import { useUser } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Login from "@/components/Login";

export default function LoginPage() {
  const { user, userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && user) {
      router.push("/"); 
    }
  }, [user, userLoading, router]);

  if (userLoading) return <p className="p-4">Loading…</p>;
  if (user) return null;

  return <Login />;
}
