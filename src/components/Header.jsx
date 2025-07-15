// "use client";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import { useUser } from "@/components/AuthProvider";
// import { memo } from "react";
// import { toast } from "sonner";

// function Header({ children }) {
//   const user = useUser();
//   const displayName = user?.user_metadata?.first_name
//     ? `${user.user_metadata.first_name}!`
//     : "Gardener!";

//   const router = useRouter();

//   const handleLogout = async () => {
//     console.log("Logout clicked");

//     try {
//       await supabase.auth.signOut();
//       console.log(
//         "Sign-out API call finished (or returned session_not_found)."
//       );
//     } catch (error) {
//       console.warn("Sign-out API error (ignoring):", error);
//     }

//     // Manually clear any persisted tokens or data
//     try {
//       localStorage.clear();
//       sessionStorage.clear();
//       console.log("Cleared localStorage and sessionStorage");
//     } catch (e) {
//       console.warn("Couldn’t clear storage:", e);
//     }

//     // Finally reload so useUser() becomes null
//     // window.location.reload();
//     router.refresh(); // Soft refreshes data without page flicker
//     toast.success("Logged out.");
//   };

//   return (
//     <header className="flex items-center justify-between p-4 bg-white shadow">
//       <h1 className="text-2xl font-bold mb-4">🌱 Here We Grow</h1>
//       {user && (
//         <>
//           <p>Hello, {displayName}</p>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
//           >
//             Logout
//           </button>
//         </>
//       )}
//       {children}
//     </header>
//   );
// }

// export default memo(Header);
// "use client";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import { useUser } from "@/components/AuthProvider";
// import { memo, useEffect } from "react";
// import { toast } from "sonner";

// function Header({ children }) {
//   const user = useUser();
//   const router = useRouter();

//   useEffect(() => {
//     console.log("Current user:", user);
//   }, [user]);

//   const handleLogout = async () => {
//     console.log("Logout clicked");

//     try {
//       await supabase.auth.signOut();
//       console.log("Sign-out API call finished (or returned session_not_found).");
//     } catch (error) {
//       console.warn("Sign-out API error (ignoring):", error);
//     }

//     try {
//       localStorage.clear();
//       sessionStorage.clear();
//       console.log("Cleared localStorage and sessionStorage");
//     } catch (e) {
//       console.warn("Couldn’t clear storage:", e);
//     }

//     router.refresh();
//     toast.success("Logged out.");
//   };

//   const displayName = user?.user_metadata?.first_name
//     ? `${user.user_metadata.first_name}!`
//     : "Gardener!";

//   return (
//     <header className="flex items-center justify-between p-4 bg-white shadow">
//       <h1 className="text-2xl font-bold mb-4">🌱 Here We Grow</h1>
//       {user && (
//         <>
//           <p>Hello {displayName}</p>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
//           >
//             Logout
//           </button>
//         </>
//       )}
//       {children}
//     </header>
//   );
// }

// export default Header; // or export default memo(Header); if you prefer

"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/AuthProvider";
import { useEffect } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function Header({ children }) {
  const user = useUser();
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

  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name}!`
    : "Gardener!";

  return (
    <header className="w-full bg-white shadow-sm">
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
        <nav className="mt-4 rounded-md bg-green-100 px-4 py-2">
          {children}
        </nav>
      </div>
    </header>
  );
}
