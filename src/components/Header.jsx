"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function Header({ children }) {
  const { user, userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.refresh();
      toast.success("Logged out.");
    } catch (err) {
      console.warn("Logout error:", err);
    }
  };

    const displayName =
    !userLoading && user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name}!`
      : "Gardener!";

  return (
    <header className="w-full bg-white shadow-sm mt-4">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Top row: logo left, greeting right */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🌱 Here We Grow</h1>
          {user && (
            <div className="flex items-center gap-2 text-gray-700">
              <p>Hello, {displayName}</p>
              <button
                onClick={handleLogout}
                title="Log out"
                className="hover:text-red-500 transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Navbar: narrow and pale green background */}
        <nav className="mt-4 rounded-md bg-green-100 px-4 py-2">{children}</nav>
      </div>
    </header>
  );
}
