import { Suspense } from "react";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/server";
import { getDictionary, type Locale } from "@/i18n";
import { getTotalWatched, getTotalHours, getRecentActivity } from "@/lib/dashboard/stats";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.dashboard.title} — MyReelMind`,
  };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Middleware gates access — we still need userId for stats
  const session = await getSession();
  const userId = session?.user.id;

  const [totalWatched, totalHours, recentActivity] = userId
    ? await Promise.all([
        getTotalWatched(userId),
        getTotalHours(userId),
        getRecentActivity(userId, 5),
      ])
    : [0, 0, []];

  return (
    <Suspense fallback={<DashboardSkeleton dict={dict.dashboard} />}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 sm:text-3xl">
          {dict.dashboard.title}
        </h1>

        {/* Stats Grid */}
        <section
          aria-label={dict.dashboard.title}
          className="mb-8 grid gap-4 sm:grid-cols-2"
        >
          <StatsCard
            label={dict.dashboard.totalWatched}
            value={totalWatched}
          />
          <StatsCard
            label={dict.dashboard.totalHours}
            value={totalHours.toFixed(1)}
          />
        </section>

        {/* Activity Feed */}
        <section aria-label={dict.dashboard.recentActivity}>
          <ActivityFeed activities={recentActivity} dict={dict.dashboard} mediaDict={dict.media} lang={lang} />
        </section>
      </main>
    </Suspense>
  );
}