import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getDictionary, type Locale } from "@/i18n";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { LibraryGrid } from "@/components/collection/LibraryGrid";

const VALID_STATUSES = ["want_to_watch", "watching", "completed", "paused", "dropped"] as const;
const VALID_TYPES = ["movie", "tv", "anime"] as const;
const LIMIT = 20;

interface LibraryPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string; page?: string; type?: string; rating?: string }>;
}

export async function generateMetadata({ params }: LibraryPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.library.title} — MyReelMind`,
  };
}

export default async function LibraryPage({ params, searchParams }: LibraryPageProps) {
  const { lang } = await params;
  const { status: statusParam, page: pageParam, type: typeParam } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect(`/${lang}/login`);
  }

  const userId = session.user.id;
  const dict = await getDictionary(lang as Locale);

  // Parse pagination params
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (currentPage - 1) * LIMIT;

  // Build query conditions
  const conditions = [eq(userMedia.userId, userId)];
  if (statusParam && VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])) {
    conditions.push(eq(userMedia.status, statusParam as (typeof VALID_STATUSES)[number]));
  }

  // Type filter condition (join with mediaItems table)
  if (typeParam && VALID_TYPES.includes(typeParam as (typeof VALID_TYPES)[number])) {
    conditions.push(eq(mediaItems.type, typeParam as (typeof VALID_TYPES)[number]));
  }

  // Get total count for pagination
  const countResult = await db
    .select({ count: count() })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(and(...conditions));
  const totalItems = countResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));

  // Fetch paginated items
  const items = await db.query.userMedia.findMany({
    where: and(...conditions),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit: LIMIT,
    offset,
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

  const resolvedTypeParam =
    typeParam && VALID_TYPES.includes(typeParam as (typeof VALID_TYPES)[number])
      ? (typeParam as (typeof VALID_TYPES)[number])
      : null;

  return (
    <Suspense fallback={<div className="p-8">{dict.common.loading}</div>}>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{dict.library.title}</h1>
          <span className="text-sm text-gray-500">
            {totalItems} {dict.library.collection}
          </span>
        </div>

        {/* Status filter tabs */}
        <nav className="mb-6 flex gap-2 border-b border-gray-200">
          {statusFilters.map((filter) => (
            <Link
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
            </Link>
          ))}
        </nav>

        {/* Library grid or empty state */}
        {formattedItems.length > 0 ? (
          <LibraryGrid
            items={formattedItems}
            lang={lang}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            statusParam={statusParam}
            typeParam={resolvedTypeParam}
            dict={{
              remove: dict.library.remove,
              removeConfirm: dict.library.removeConfirm,
              cancel: dict.common.cancel,
              noEpisodes: dict.library.noEpisodes,
              statusUpdated: dict.library.statusUpdated,
              ratingUpdated: dict.library.ratingUpdated,
              progressUpdated: dict.library.progressUpdated,
              removed: dict.library.removed,
              error: dict.common.error,
              status: dict.media.status,
              statusLabel: dict.library.status,
              rating: dict.library.rating,
              yourRating: dict.library.yourRating,
              notRated: dict.library.notRated,
              clear: dict.common.cancel,
              progress: dict.library.progress,
              episode: dict.media.episode,
              chapter: dict.media.chapter,
              of: dict.media.of,
              previous: dict.library.previous,
              next: dict.library.next,
              page: dict.library.page,
              totalItems: dict.library.totalItems,
              allTypes: dict.library.allTypes,
              filterMovie: dict.library.filterMovie,
              filterTv: dict.library.filterTv,
              filterAnime: dict.library.filterAnime,
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-gray-500">{dict.library.empty}</p>
            <Link
              href={`/${lang}/search`}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              {dict.dashboard.ctaSearch}
            </Link>
          </div>
        )}
      </main>
    </Suspense>
  );
}