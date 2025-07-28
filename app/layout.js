// app/layout.jsx
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "sonner";
import ConditionalHeader from "@/components/ConditionalHeader";


export const metadata = {
  title: "Here We Grow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="max-w-xl mx-auto">
            <ConditionalHeader />

            {children}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "!text-green-600 !bg-green-50 !border !border-green-300 !text-2xl !px-6 !py-4 !rounded-xl !shadow-md !font-medium",
                title: "!font-semibold !text-xl !pl-3",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
