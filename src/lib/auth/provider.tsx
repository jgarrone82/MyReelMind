"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const AuthContext = createContext<SupabaseClient | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Clear any client-side auth state if needed
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={supabase}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthClient(): SupabaseClient {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthClient must be used within an AuthProvider");
  }
  return context;
}
