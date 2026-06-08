"use client";

import { useEffect, useState } from "react";
import { useAuthClient } from "@/lib/auth/provider";

/**
 * Read the current authenticated user id from the browser Supabase client.
 *
 * Resolves the user on mount via `getUser()` and stays in sync with sign-in /
 * sign-out via `onAuthStateChange`. Returns `null` when logged out, which
 * lets cosmetic features (e.g. library-state badges) gate their fetches so a
 * logged-out user never triggers a user-specific request.
 *
 * Always call this unconditionally (rules of hooks); the returned value — not
 * the call — is what gates downstream work.
 */
export function useAuthUserId(): string | null {
  const supabase = useAuthClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // An auth-state-change event reflects the freshest auth truth. If one fires
    // while the slow `getUser()` round-trip is still pending, the late
    // resolution must NOT override it — otherwise a stale id can transiently
    // clobber a SIGNED_OUT (breaking the "logged-out never fetches" gate).
    let authEventSeen = false;

    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active && !authEventSeen) setUserId(data.user?.id ?? null);
      })
      .catch(() => {
        // A failed getUser() must not crash consumers — treat as logged out.
        if (active && !authEventSeen) setUserId(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Guard against a setState-after-unmount: `unsubscribe()` does not always
      // synchronously stop an in-flight/queued event, so a late callback after
      // cleanup must be a no-op rather than touching unmounted state.
      if (!active) return;
      authEventSeen = true;
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return userId;
}
