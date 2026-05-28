import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, getDictionary, type Locale } from "@/i18n";
import { DictionaryProvider } from "@/i18n/provider";
import { AuthProvider } from "@/lib/auth/provider";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { vhsFontVariables } from "../fonts";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: dict.app.title,
    description: dict.app.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vhsFontVariables} antialiased`}
      >
        <header className="border-b border-primary bg-primary">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-6">
                <a href={`/${lang}`} className="text-lg font-semibold text-primary">
                  MyReelMind
                </a>
                <a href={`/${lang}/search`} className="text-sm text-secondary hover:text-primary">
                  {dict.nav.search}
                </a>
                <a href={`/${lang}/library`} className="text-sm text-secondary hover:text-primary">
                  {dict.nav.library}
                </a>
              </nav>
              <div className="flex items-center gap-4">
                <ThemeToggle
                  dict={{
                    themeSystem: dict.settings.themeSystem,
                    themeLight: dict.settings.themeLight,
                    themeDark: dict.settings.themeDark,
                  }}
                />
                <UserMenu dict={dict} lang={lang} />
              </div>
            </div>
          </div>
        </header>
        <Toaster position="top-right" />
        <Providers>
          <AuthProvider>
            <DictionaryProvider dictionary={dict}>
              {children}
            </DictionaryProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}