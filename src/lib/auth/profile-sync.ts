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

  // Check if profile already exists (by auth user id — NOT email).
  // Using email as the dedup key silently reuses a stale profile when the
  // same email has a different auth id, breaking RLS (auth.uid() = id).
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  // Profile exists with correct id — idempotent no-op
  if (existing.length > 0) return;

  // Upsert by email: if a profile with this email already exists (different id),
  // update the id to match the current auth user. The email column has a UNIQUE
  // constraint, so a plain INSERT would violate it. onConflictDoUpdate handles
  // the edge case where a user's auth id changed but their email stayed the same.
  await db
    .insert(users)
    .values({
      id: authUser.id,
      email: authUser.email!,
      displayName: authUser.user_metadata?.full_name ?? null,
      avatarUrl: authUser.user_metadata?.avatar_url ?? null,
      createdAt: new Date(authUser.created_at),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        id: authUser.id,
        displayName: authUser.user_metadata?.full_name ?? null,
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
        updatedAt: new Date(),
      },
    });
}