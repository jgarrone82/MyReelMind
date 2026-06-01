import { Suspense } from "react";
import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/i18n";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.dashboard.title} — MyReelMind`,
  };
}

/**
 * Home route `/[lang]`. This route is NOT in middleware.ts protectedRoutes, so
 * there is no auth gate here — a null session is handled inside DashboardContent
 * by rendering the empty ("STORE CLOSED") state.
 *
 * The data-fetching body lives in DashboardContent behind a <Suspense> boundary
 * so its awaits stream the DashboardSkeleton fallback during fetch. Keeping the
 * boundary here (rather than a [lang]/loading.tsx) scopes the skeleton to the
 * dashboard and does not leak it to other routes under [lang].
 */
export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <Suspense fallback={<DashboardSkeleton dict={dict.dashboard} />}>
      <DashboardContent lang={lang} dict={dict} />
    </Suspense>
  );
}
