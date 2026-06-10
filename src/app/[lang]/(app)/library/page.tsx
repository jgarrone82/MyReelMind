import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { getDictionary, type Locale } from "@/i18n";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { LibraryGrid } from "@/components/collection/LibraryGrid";
import { TapeSkeleton } from "@/components/search/TapeSkeleton";

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

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/${lang}/login`);
  }

  const userId = user.id;
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
    <Suspense
      fallback={
        <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p role="status" className="sr-only">
              {dict.common.loading}
            </p>
            <TapeSkeleton count={8} />
          </div>
        </main>
      }
    >
      <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            {/* Membership desk sticker */}
            <span className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
              {dict.library.kicker}
            </span>
            <div className="mt-3 flex items-center justify-between">
              <h1 className="vhs-display m-0 text-[clamp(1.7rem,5vw,2.3rem)] text-[var(--vhs-cream)]">
                {dict.library.title}
              </h1>
              <span className="vhs-kicker text-[0.78rem] tracking-[0.14em] text-[var(--vhs-cream-dim)]">
                {totalItems} {dict.library.collection}
              </span>
            </div>
            <div className="vhs-mono mt-1.5 text-[0.72rem] tracking-[0.14em] text-[var(--vhs-phosphor)]">
              <span aria-hidden>▸</span> {dict.library.subtitle}
            </div>
          </div>

          {/* Status filter tabs — canonical VHS chip pattern */}
          <nav className="mb-6 flex flex-wrap gap-3">
            {statusFilters.map((filter) => {
              const isActive = (statusParam ?? "all") === filter.key;
              return (
                <Link
                  key={filter.key}
                  href={
                    filter.key === "all"
                      ? `/${lang}/library`
                      : `/${lang}/library?status=${filter.key}`
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={`vhs-kicker inline-flex items-center gap-2 border-2 border-[var(--vhs-ground)] px-3.5 py-1.5 text-[0.78rem] tracking-[0.14em] shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-transform duration-[90ms] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)] ${
                    isActive
                      ? // WCAG AA (#48): deep-ink on neon magenta = 5.58:1; cream-on-magenta
                        // (2.98:1) failed for this small selected-chip label.
                        "bg-[var(--vhs-magenta)] text-[var(--vhs-ground)]"
                      : "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream-dim)] hover:text-[var(--vhs-cream)]"
                  }`}
                >
                  {/* Channel LED — decorative tuner indicator, lit when active. */}
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${
                      isActive
                        ? "bg-[var(--vhs-phosphor)] shadow-[0_0_6px_var(--vhs-phosphor)]"
                        : "bg-[var(--vhs-ground-3)]"
                    }`}
                  />
                  {filter.label}
                </Link>
              );
            })}
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
            <div className="mx-auto my-16 max-w-md border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] px-6 py-12 text-center shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
              <p className="vhs-kicker text-lg text-[var(--vhs-cream)]">
                {dict.library.empty}
              </p>
              <Link
                href={`/${lang}/search`}
                className="vhs-btn vhs-btn--ghost mt-4 text-[var(--vhs-phosphor)] hover:text-[var(--vhs-magenta)]"
              >
                {dict.dashboard.ctaSearch} <span aria-hidden>→</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </Suspense>
  );
}