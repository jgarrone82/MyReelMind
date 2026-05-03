import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";

/**
 * Ensures a user profile exists in the public.users table.
 * Uses the auth user's ID (not a random one) to maintain referential integrity.
 *
 * This function is idempotent:
 * - If the user profile already exists, it does nothing.
 * - If it doesn't exist, it creates one with the exact auth.users.id.
 *
 * @param authUser - The Supabase Auth user object (from onAuthStateChange or getSession)
 */
export async function ensureUserProfile(authUser: User | null): Promise<void> {
  // Guard: no auth user means nothing to sync
  if (!authUser) return;

  // Check if profile already exists (by email as unique key)
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, authUser.email!))
    .limit(1);

  // Profile exists — idempotent no-op
  if (existing.length > 0) return;

  // Create profile with authUser.id (NOT a random UUID!)
  // This is critical: the id in public.users MUST match auth.users.id
  // so that RLS policies (auth.uid() = id) work correctly.
  await db.insert(users).values({
    id: authUser.id,
    email: authUser.email!,
    displayName: authUser.user_metadata?.full_name ?? null,
    avatarUrl: authUser.user_metadata?.avatar_url ?? null,
    createdAt: new Date(authUser.created_at),
    updatedAt: new Date(),
  });
}