import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/auth/profile-sync';
import { locales } from '@/i18n';

/**
 * Auth Callback Route Handler
 * 
 * Handles redirects from:
 * - OAuth providers (PKCE `code`, no type)
 * - Password reset emails (type=recovery, via token_hash OR PKCE code)
 * - Email verification (type=signup)
 * 
 * @see https://supabase.com/docs/reference/javascript/auth-onauthstatechange
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const tokenHash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Build redirect URL with locale.
  // The first path segment is only a locale if it matches a known locale;
  // for unprefixed paths like /auth/callback the segment is "auth", so we
  // must fall back to the default English locale instead of trusting it.
  const segment = request.nextUrl.pathname.split('/')[1];
  const locale = (locales as string[]).includes(segment) ? segment : 'en';

  // Handle OAuth error
  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(error)}`, request.url));
  }

  try {
    const supabase = await createClient();

    // OAuth (PKCE) callback — identified solely by the `code` param. Supabase
    // does NOT append a `type=code` query param (and our redirectTo never adds
    // one), so requiring type === 'code' meant the exchange never ran and every
    // OAuth login fell through to unknown_callback_type.
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Auth callback: OAuth code exchange failed:', exchangeError);
        return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_exchange_failed`, request.url));
      }

      // Sync the profile here — this route handler runs in the Node serverless
      // runtime, where the Postgres driver works (the edge middleware cannot:
      // TCP DB connections are unavailable in the Edge runtime). OAuth users
      // never hit the signIn/signUp actions, so the callback owns their sync.
      // Resolve the user via getUser() (the revalidated, authoritative source) —
      // exchangeCodeForSession's `data.user` is not reliably populated, which
      // previously left public.users empty and broke the user_media FK.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        // Don't fail the login (the session is valid), but never swallow this:
        // a successful exchange with no resolvable user is the silent path that
        // previously left public.users empty and broke the user_media FK.
        console.error('Auth callback: no user after successful exchange; profile not synced:', userError);
      }
      await ensureUserProfile(user);

      // Password-recovery and signup-verification links can also arrive via
      // PKCE (type + code instead of token_hash), so the exchange above runs
      // for them too. Mirror the token_hash branch so the destination stays
      // consistent regardless of which email-link mode Supabase is configured
      // for: recovery -> reset-password form, signup -> login?verified=true.
      // Plain OAuth has no `type` and falls through to home.
      if (type === 'recovery') {
        return NextResponse.redirect(new URL(`/${locale}/reset-password`, request.url));
      }
      if (type === 'signup') {
        return NextResponse.redirect(new URL(`/${locale}/login?verified=true`, request.url));
      }

      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Password reset or email verification callback (type=recovery or type=signup)
    if (type && tokenHash) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: type as 'recovery' | 'signup',
        token_hash: tokenHash,
      });

      if (verifyError) {
        return NextResponse.redirect(new URL(`/${locale}/login?error=token_verification_failed`, request.url));
      }

      // For recovery, redirect to reset password page with session established
      if (type === 'recovery') {
        return NextResponse.redirect(new URL(`/${locale}/reset-password`, request.url));
      }

      // For signup verification, redirect to login with success message
      if (type === 'signup') {
        return NextResponse.redirect(new URL(`/${locale}/login?verified=true`, request.url));
      }
    }

    // Fallback: unknown callback type
    return NextResponse.redirect(new URL(`/${locale}/login?error=unknown_callback_type`, request.url));
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(new URL(`/${locale}/login?error=internal_server_error`, request.url));
  }
}
