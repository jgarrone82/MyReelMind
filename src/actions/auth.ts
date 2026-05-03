"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profile-sync";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  success?: boolean;
};

/**
 * Sign in with email and password.
 */
export async function signIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Authentication failed" };
  }

  // Sync profile to public.users (idempotent)
  await ensureUserProfile(data.user);

  revalidatePath("/");
  redirect("/dashboard");
}

/**
 * Sign up with email and password.
 */
export async function signUp(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  // Validate inputs
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Registration failed" };
  }

  // Sync profile to public.users (idempotent)
  await ensureUserProfile(data.user);

  revalidatePath("/");
  redirect("/dashboard");
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  redirect("/");
}

/**
 * Initiate OAuth sign in with Google or GitHub.
 * Returns the OAuth URL to redirect to.
 */
export async function signInWithOAuth(
  provider: "google" | "github"
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.url) {
    return { error: "Failed to get OAuth URL" };
  }

  return { url: data.url };
}