import { getDictionary, type Locale } from "@/i18n";
import { VhsHeader } from "@/components/vhs/Header";
import { AppTabBar } from "@/components/vhs/AppTabBar";
import { UserMenu } from "@/components/auth/UserMenu";

// App-only chrome shell. Route groups are URL-transparent, so the chrome
// (VhsHeader + AppTabBar) renders ONLY on app pages — never on auth pages,
// which live under the sibling (auth) pass-through layout.
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <VhsHeader
        brand={{ name: dict.brand.name, sub: dict.brand.sub }}
        openLabel={dict.brand.openLabel}
        brandHref={`/${lang}`}
        actions={<UserMenu dict={dict} lang={lang} />}
      />
      <AppTabBar lang={lang} nav={dict.nav} />
      {children}
    </>
  );
}
