import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth Callback Route Handler
 * 
 * Handles redirects from:
 * - OAuth providers (type=code)
 * - Password reset emails (type=recovery)
 * - Email verification (type=signup)
 * 
 * @see https://supabase.com/docs/reference/javascript/auth-onauthstatechange
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const tokenHash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');

  // Build redirect URL with locale
  const locale = request.nextUrl.pathname.split('/')[1] ?? 'en';
  const redirectUrl = new URL(`/${locale}${next}`, request.url);

  // Handle OAuth error
  if (error) {
    return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(error)}`, request.url));
  }

  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // OAuth callback (type=code)
    if (type === 'code' && code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        return NextResponse.redirect(new URL(`/${locale}/login?error=oauth_exchange_failed`, request.url));
      }

      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
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
