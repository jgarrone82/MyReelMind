import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getDictionary, type Locale } from "@/i18n";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { LibraryGrid } from "@/components/collection/LibraryGrid";

interface LibraryPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string; page?: string; type?: string; rating?: string }>;
}

const VALID_STATUSES = ["want_to_watch", "watching", "completed", "paused", "dropped"] as const;

export async function generateMetadata({ params }: LibraryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.library.title} — MyReelMind`,
  };
}

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { lang } = await params;
  const { status: statusParam, page: pageParam } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect(`/${lang}/login`);
  }

  const userId = session.user.id;
  const dict = await getDictionary(lang as Locale);

  // Build query conditions
  const conditions = [eq(userMedia.userId, userId)];
  if (statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])) {
    conditions.push(eq(userMedia.status, statusParam as (typeof VALID_STATUSES)[number]));
  }

  // Fetch user's library
  const items = await db.query.userMedia.findMany({
    where: and(...conditions),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
  });

  // Format for LibraryGrid
  const formattedItems = items.map((item) => ({
    id: item.id,
    mediaItemId: item.mediaItemId,
    publicId: item.mediaItem
      ? `${item.mediaItem.source}-${item.mediaItem.sourceId}`
      : "",
    status: item.status,
    progress: item.progress,
    rating: item.rating,
    updatedAt: item.updatedAt.toISOString(),
    mediaItem: item.mediaItem
      ? {
          source: item.mediaItem.source,
          sourceId: item.mediaItem.sourceId,
          title: item.mediaItem.title,
          posterPath: item.mediaItem.posterPath,
          type: item.mediaItem.type,
          runtime: item.mediaItem.runtime,
        }
      : {
          source: "tmdb" as const,
          sourceId: "",
          title: null,
          posterPath: null,
          type: "movie" as const,
          runtime: null,
        },
  }));

  // Status filter tabs
  const statusFilters = [
    { key: "all", label: dict.library.filterAll },
    { key: "watching", label: dict.library.filterWatching },
    { key: "completed", label: dict.library.filterCompleted },
    { key: "dropped", label: dict.library.filterDropped },
    { key: "want_to_watch", label: dict.library.filterPlanned },
  ];

  return (
    <Suspense fallback={<div className="p-8">{dict.common.loading}</div>}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{dict.library.title}</h1>
          <span className="text-sm text-gray-500">
            {items.length} {dict.library.collection}
          </span>
        </div>

        {/* Status filter tabs */}
        <nav className="mb-6 flex gap-2 border-b border-gray-200">
          {statusFilters.map((filter) => (
            <a
              key={filter.key}
              href={
                filter.key === "all"
                  ? `/${lang}/library`
                  : `/${lang}/library?status=${filter.key}`
              }
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                (statusParam ?? "all") === filter.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {filter.label}
            </a>
          ))}
        </nav>

        {/* Library grid or empty state */}
        {formattedItems.length > 0 ? (
          <LibraryGrid
            items={formattedItems}
            lang={lang}
            dict={{
              remove: dict.library.remove,
              removeConfirm: dict.library.removeConfirm,
              noEpisodes: dict.library.noEpisodes,
              statusUpdated: dict.library.statusUpdated,
              ratingUpdated: dict.library.ratingUpdated,
              progressUpdated: dict.library.progressUpdated,
              removed: dict.library.removed,
              error: dict.common.error,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-gray-500">{dict.library.empty}</p>
            <a
              href={`/${lang}/search`}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              {dict.dashboard.ctaSearch}
            </a>
          </div>
        )}
      </main>
    </Suspense>
  );
}