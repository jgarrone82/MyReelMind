import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { locales, getDictionary, type Locale } from "@/i18n";
import { DictionaryProvider } from "@/i18n/provider";
import { AuthProvider } from "@/lib/auth/provider";
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
    <html lang={lang} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vhsFontVariables} bg-[var(--vhs-ground)] text-[var(--vhs-cream)] antialiased`}
      >
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
