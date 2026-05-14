"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f0f0f",
            color: "#fafafa",
            borderRadius: "12px",
            fontSize: "13px",
            letterSpacing: "0.02em",
            padding: "14px 18px",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          },
          success: {
            iconTheme: { primary: "#b8860b", secondary: "#fafafa" },
          },
        }}
      />
    </SessionProvider>
  );
}
