"use client";
import { useUser } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SetupPage() {
  const user = useUser();
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user]);

  if (!user) return <p>Login here.</p>;

  return <div>Welcome, {user.user_metadata.first_name}</div>;
}
