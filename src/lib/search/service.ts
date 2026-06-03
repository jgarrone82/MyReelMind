import { createTmdbClient } from "@/lib/api/tmdb/client";
import { createAniListClient } from "@/lib/api/anilist/client";
import { AniListQueue } from "@/lib/api/anilist/queue";
import { normalizeTmdbResults, normalizeAniListResults, type MediaItem } from "@/lib/api/merge";
import { db } from "@/db";
import { mediaItems } from "@/db/schema";
import { sql } from "drizzle-orm";

const tmdbClient = createTmdbClient({
  apiKey: process.env.TMDB_API_KEY!,
});

const anilistClient = createAniListClient({
  queue: new AniListQueue({ minIntervalMs: 0, maxRetries: 0 }),
});

export interface SearchOptions {
  page?: number;
  type?: "all" | "movie" | "tv" | "anime";
  year?: number;
}

export interface SearchResults {
  results: MediaItem[];
  totalPages: number;
}

export interface TrendingResults {
  results: MediaItem[];
}

const TRENDING_LIMIT = 15;

/**
 * Alternating interleave of two sources (a0, b0, a1, b1, ...), dropping an
 * exhausted source, deduped by id, capped at TRENDING_LIMIT. Keeps both
 * sources visible in the first row of the shelf instead of burying one.
 */
function interleave(a: MediaItem[], b: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  const merged: MediaItem[] = [];
  const max = Math.max(a.length, b.length);

  for (let i = 0; i < max && merged.length < TRENDING_LIMIT; i++) {
    for (const item of [a[i], b[i]]) {
      if (!item || seen.has(item.id) || merged.length >= TRENDING_LIMIT) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }

  return merged;
}

/**
 * Trending shelf for the empty-query search state. Fetches both sources in
 * parallel via allSettled so a single-source failure still yields a populated
 * shelf; both failing yields an empty array (the UI degrades to the honest
 * prompt). Trending is weekly/transient — it is NOT persisted to the DB cache.
 */
export async function getTrending(): Promise<TrendingResults> {
  const [tmdbSettled, aniListSettled] = await Promise.allSettled([
    tmdbClient.trending(),
    anilistClient.trending(TRENDING_LIMIT),
  ]);

  const tmdbResults =
    tmdbSettled.status === "fulfilled"
      ? normalizeTmdbResults(tmdbSettled.value)
      : [];
  const aniListResults =
    aniListSettled.status === "fulfilled"
      ? normalizeAniListResults(aniListSettled.value)
      : [];

  return { results: interleave(tmdbResults, aniListResults) };
}

export async function searchMedia(query: string, options: SearchOptions = {}): Promise<SearchResults> {
  const { page = 1, type = "all" } = options;

  const promises: Promise<unknown>[] = [];

  const shouldQueryTmdb = type === "all" || type === "movie" || type === "tv";
  const shouldQueryAnilist = type === "all" || type === "anime";

  if (shouldQueryTmdb) {
    promises.push(tmdbClient.search(query, page));
  } else {
    promises.push(Promise.resolve(null));
  }

  if (shouldQueryAnilist) {
    promises.push(
      anilistClient
        .search({ query, type: "ANIME", page, perPage: 10 })
        .catch(() => null)
    );
  } else {
    promises.push(Promise.resolve(null));
  }

  const [tmdbResponse, aniListMedia] = await Promise.all(promises);

  const tmdbResults = normalizeTmdbResults(tmdbResponse as Parameters<typeof normalizeTmdbResults>[0]);
  const aniListResults = normalizeAniListResults(aniListMedia as Parameters<typeof normalizeAniListResults>[0]);

  const merged = [...tmdbResults, ...aniListResults];

  // Get totalPages from TMDB response (authoritative source for pagination)
  let totalPages = 1;
  if (tmdbResponse && typeof tmdbResponse === "object" && "total_pages" in tmdbResponse) {
    totalPages = (tmdbResponse as { total_pages: number }).total_pages;
  }

  // Cache results in DB
  await cacheSearchResults(merged);

  return { results: merged, totalPages };
}

async function cacheSearchResults(results: MediaItem[]) {
  if (results.length === 0) return;

  const values = results.map((item) => ({
    source: item.source,
    sourceId: String(item.id).replace(`${item.source}-`, ""),
    type: item.type === "manga" ? "anime" : item.type,
    title: item.title ?? "Unknown",
    originalTitle: item.originalTitle,
    overview: item.description,
    releaseDate: item.year ? String(item.year) : null,
    posterPath: item.coverImage,
    backdropPath: item.bannerImage,
    genres: item.genres,
    rawData: item as unknown as Record<string, unknown>,
    fetchedAt: new Date(),
  }));

  try {
    await db
      .insert(mediaItems)
      .values(values as typeof mediaItems.$inferInsert[])
      .onConflictDoUpdate({
        target: [mediaItems.source, mediaItems.sourceId],
        set: {
          title: sql`EXCLUDED.title`,
          overview: sql`EXCLUDED.overview`,
          posterPath: sql`EXCLUDED.poster_path`,
          backdropPath: sql`EXCLUDED.backdrop_path`,
          rawData: sql`EXCLUDED.raw_data`,
          fetchedAt: sql`EXCLUDED.fetched_at`,
        },
      });
  } catch {
    // Silently fail caching — search results are still valid
  }
}
