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
 *
 * `lang` is bound by the calling form via `.bind(null, lang)` so the
 * post-auth redirect stays on the user's active locale instead of being
 * bounced to the default locale by the i18n middleware.
 */
export async function signIn(
  lang: string,
  prevState: AuthState | null,
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
  redirect(`/${lang}`);
}

/**
 * Sign up with email and password.
 *
 * `lang` is bound by the calling form via `.bind(null, lang)` so every
 * post-signup redirect stays on the user's active locale.
 */
export async function signUp(
  lang: string,
  prevState: AuthState | null,
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

  // If email is already confirmed (OAuth or auto-confirm config), go to the
  // locale-prefixed home dashboard. The redirect keeps the active locale so
  // the i18n middleware does not bounce the user to the default locale.
  if (data.user.email_confirmed_at) {
    redirect(`/${lang}`);
  }

  // Otherwise redirect to the locale-prefixed verification-sent page.
  const encodedEmail = encodeURIComponent(email);
  redirect(`/${lang}/verification-sent?email=${encodedEmail}`);
}

/**
 * Sign out the current user.
 *
 * `lang` is bound by the calling form via `.bind(null, lang)` so the
 * post-logout redirect stays on the user's active locale.
 */
export async function signOut(lang: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/");
  redirect(`/${lang}`);
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

/**
 * Request a password reset email.
 */
export async function forgotPassword(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string | null;

  if (!email) {
    return { error: "Email is required" };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Update the password for the current session (after recovery token verified).
 *
 * `lang` is bound by the calling form via `.bind(null, lang)` so the
 * post-update redirect to the login page stays on the user's active locale.
 */
export async function updatePassword(
  lang: string,
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const password = formData.get("password") as string | null;
  const confirmPassword = formData.get("confirmPassword") as string | null;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  redirect(`/${lang}/login?password_updated=true`);
}

/**
 * Send a verification email to the given address (used during signup).
 */
export async function sendVerificationEmail(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string | null;

  if (!email) {
    return { error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Invalid email format" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Re-send verification email to the current logged-in user.
 */
export async function resendVerificationEmail(): Promise<AuthState> {
  const supabase = await createClient();

  // #52 deferral: no userId drives an authorization/data-scoping decision here.
  // The email is read from the locally-decoded cookie (NOT server-revalidated),
  // so a stale/tampered token's worst case is a misdirected verification email —
  // no user-owned data is accessed or scoped. getSession is acceptable.
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !data.session) {
    return { error: "Not authenticated" };
  }

  const email = data.session.user.email;
  if (!email) {
    return { error: "User has no email" };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}