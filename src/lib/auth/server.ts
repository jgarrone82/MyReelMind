import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the locally-decoded session from cookies, or null.
 *
 * WARNING: getSession() only decodes the JWT from the request cookies and
 * trusts it WITHOUT revalidating against the Supabase Auth server. A stale or
 * tampered token still yields a session. Do NOT use this for authorization or
 * data-scoping decisions — use {@link getAuthenticatedUser} for any userId that
 * drives an authorization check or scopes a read/write of user-owned data.
 * This helper is only safe for non-sensitive display/existence checks.
 */
export async function getSession() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

/**
 * Returns the SERVER-REVALIDATED authenticated user, or null.
 *
 * Use this (not getSession) whenever userId drives an authorization or
 * data-scoping decision. getUser() revalidates the JWT against the Supabase
 * Auth server, so a stale or revoked token resolves to null; getSession() only
 * decodes the cookie locally and trusts it.
 *
 * Never throws: an auth error, a network error, or no user all resolve to null,
 * mirroring getSession()'s catch-to-null contract so consumers' existing
 * null-branches stay valid.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
