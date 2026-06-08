import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { locales, defaultLocale } from "@/i18n";
import { createServerClient } from "@supabase/ssr";
import { ensureUserProfile } from "@/lib/auth/profile-sync";

const protectedRoutes = ["/dashboard", "/library", "/verify-email", "/settings"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create supabase client for session check (uses mocked createServerClient in tests)
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Skip locale redirect for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    // Always call updateSession() to refresh tokens for all routes
    await updateSession(request);
    return supabaseResponse;
  }

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to default locale
    const locale = defaultLocale;
    const newPath = pathname === "/" ? `/${locale}/` : `/${locale}${pathname}`;
    const newUrl = new URL(newPath, request.url);
    return NextResponse.redirect(newUrl, 307);
  }

  // Extract locale from pathname
  const locale = pathname.split("/")[1];

  // #52 deferral: this is a fast first-pass route gate. Token revalidation
  // already happens in updateSession() below (it calls getUser()), and the
  // authoritative auth checks now live in the migrated pages/routes. A naive
  // getSession→getUser swap here would add a second getUser() per request (this
  // client + updateSession), doubling the auth-server round-trips on every
  // navigation — left for a dedicated middleware refactor. (created via mocked
  // createServerClient in tests)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Always call updateSession() to refresh tokens for all routes
  await updateSession(request);

  // Ensure profile exists for both email and OAuth logins
  if (session) {
    await ensureUserProfile(session.user);
  }

  // Auth gate logic
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(`/${locale}${route}`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === `/${locale}${route}` || pathname === `/${locale}${route}/`
  );

  // Protected route without session → redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route with session → redirect to dashboard
  if (isAuthRoute && session) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};