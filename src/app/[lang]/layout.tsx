import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, getDictionary, type Locale } from "@/i18n";
import { DictionaryProvider } from "@/i18n/provider";
import { AuthProvider } from "@/lib/auth/provider";
import { UserMenu } from "@/components/auth/UserMenu";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-6">
                <a href={`/${lang}`} className="text-lg font-semibold">
                  MyReelMind
                </a>
                <a href={`/${lang}/search`} className="text-sm text-gray-600 hover:text-gray-900">
                  {dict.nav.search}
                </a>
                <a href={`/${lang}/library`} className="text-sm text-gray-600 hover:text-gray-900">
                  {dict.nav.library}
                </a>
              </nav>
              <UserMenu dict={dict} />
            </div>
          </div>
        </header>
        <AuthProvider>
          <DictionaryProvider dictionary={dict}>
            {children}
          </DictionaryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
