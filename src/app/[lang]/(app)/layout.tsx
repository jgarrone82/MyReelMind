import { getDictionary, type Locale } from "@/i18n";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { VhsHeader } from "@/components/vhs/Header";
import { AppTabBar } from "@/components/vhs/AppTabBar";
import { UserMenu } from "@/components/auth/UserMenu";

// App-only chrome shell. Route groups are URL-transparent, so the chrome
// (VhsHeader + AppTabBar) renders ONLY on app pages — never on auth pages,
// which live under the sibling (auth) pass-through layout.
//
// The member AppTabBar is gated on auth: a logged-OUT visitor has no use for
// protected member tabs (they only bounce to login). We resolve the user with
// getAuthenticatedUser — the SAME server-revalidated signal DashboardContent
// uses to choose GuestWelcome vs. dashboard — so the TabBar and the page
// content never disagree for a stale token. The VhsHeader stays unconditional
// (its UserMenu already renders null for a guest).
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const user = await getAuthenticatedUser();

  return (
    <>
      <VhsHeader
        brand={{ name: dict.brand.name, sub: dict.brand.sub }}
        openLabel={dict.brand.openLabel}
        brandHref={`/${lang}`}
        actions={<UserMenu dict={dict} lang={lang} />}
      />
      {user ? <AppTabBar lang={lang} nav={dict.nav} /> : null}
      {children}
    </>
  );
}
