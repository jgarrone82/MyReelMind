import { db } from "@/db";
import { mediaItems } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createTmdbClient } from "@/lib/api/tmdb/client";
import { createAniListClient } from "@/lib/api/anilist/client";
import { AniListQueue } from "@/lib/api/anilist/queue";
import type { MediaItem } from "@/lib/api/merge";

const STALE_THRESHOLD_MS = 1000 * 60 * 60; // 1 hour

/** A fetched media item plus the localized overviews to cache for it. */
type FetchResult = { item: MediaItem; overviews: Record<string, string> };

function getTmdbClient() {
  return createTmdbClient({
    apiKey: process.env.TMDB_API_KEY!,
  });
}

function getAniListClient() {
  return createAniListClient({
    queue: new AniListQueue({ minIntervalMs: 0, maxRetries: 0 }),
  });
}

/** Map our app locale to the TMDB language tag it expects. */
const TMDB_LANGUAGE_BY_LOCALE: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
};

function toTmdbLanguage(locale: string): string {
  return TMDB_LANGUAGE_BY_LOCALE[locale] ?? "en-US";
}

/** Resolve the best available description: requested locale → English → legacy column. */
function resolveOverview(
  overviews: Record<string, string> | null,
  fallback: string | null,
  locale: string
): string | null {
  return overviews?.[locale] || overviews?.en || fallback || null;
}

function parseMediaId(id: string): { source: "tmdb" | "anilist"; sourceId: string } | null {
  if (id.startsWith("tmdb-")) {
    return { source: "tmdb", sourceId: id.replace("tmdb-", "") };
  }
  if (id.startsWith("anilist-")) {
    return { source: "anilist", sourceId: id.replace("anilist-", "") };
  }
  return null;
}

function normalizeDbItem(item: typeof mediaItems.$inferSelect, locale: string): MediaItem {
  const sourceId = item.sourceId;
  const id = `${item.source}-${sourceId}`;

  return {
    id,
    source: item.source,
    type: item.type,
    title: item.title,
    originalTitle: item.originalTitle ?? null,
    year: item.releaseDate ? parseInt(item.releaseDate, 10) : null,
    description: resolveOverview(item.overviews, item.overview, locale),
    score: null,
    popularity: null,
    coverImage: item.posterPath,
    bannerImage: item.backdropPath,
    genres: item.genres ?? [],
  };
}

function isStale(fetchedAt: Date | null): boolean {
  if (!fetchedAt) return true;
  return Date.now() - fetchedAt.getTime() > STALE_THRESHOLD_MS;
}

async function fetchFromTmdb(sourceId: string, locale: string): Promise<FetchResult | null> {
  try {
    const numericId = parseInt(sourceId, 10);
    if (isNaN(numericId)) return null;

    const tmdbClient = getTmdbClient();
    const language = toTmdbLanguage(locale);

    // Try movie first, then TV
    let details = await tmdbClient.getDetails("movie", numericId, { language }).catch(() => null);
    let type: "movie" | "tv" = "movie";

    if (!details) {
      details = await tmdbClient.getDetails("tv", numericId, { language }).catch(() => null);
      type = "tv";
    }

    if (!details) return null;

    const overviews: Record<string, string> = {};
    const localizedOverview: string = (details as any).overview || "";
    // Always record the requested locale (even when empty) so a title with no
    // translation is cached as a negative — otherwise every view refetches.
    overviews[locale] = localizedOverview;
    let bestOverview: string = localizedOverview;

    // TMDB returns an empty overview when the localized translation is missing.
    // Fall back to English so a non-English view never shows an empty synopsis.
    if (!localizedOverview && locale !== "en") {
      const enDetails = await tmdbClient
        .getDetails(type, numericId, { language: "en-US" })
        .catch(() => null);
      const enOverview: string = (enDetails as any)?.overview || "";
      if (enOverview) {
        overviews.en = enOverview;
        bestOverview = enOverview;
      }
    }

    const title = type === "movie" ? (details as any).title : (details as any).name;
    const originalTitle = type === "movie" ? (details as any).original_title : (details as any).original_name;
    const date = type === "movie" ? (details as any).release_date : (details as any).first_air_date;
    const year = date ? parseInt(date.split("-")[0], 10) : null;

    const item: MediaItem = {
      id: `tmdb-${numericId}`,
      source: "tmdb",
      type,
      title: title ?? null,
      originalTitle: originalTitle ?? null,
      year,
      description: bestOverview || null,
      score: (details as any).vote_average != null ? Math.round((details as any).vote_average * 10) : null,
      popularity: (details as any).popularity ?? null,
      coverImage: (details as any).poster_path ? `https://image.tmdb.org/t/p/w500${(details as any).poster_path}` : null,
      bannerImage: (details as any).backdrop_path ? `https://image.tmdb.org/t/p/original${(details as any).backdrop_path}` : null,
      genres: (details as any).genre_ids ?? [],
    };

    return { item, overviews };
  } catch {
    return null;
  }
}

async function fetchFromAniList(sourceId: string): Promise<FetchResult | null> {
  try {
    const numericId = parseInt(sourceId, 10);
    if (isNaN(numericId)) return null;

    const anilistClient = getAniListClient();
    const media = await anilistClient.getMediaById(numericId);
    if (!media) return null;

    const isAnime = media.type === "ANIME";
    const type = isAnime ? "anime" : "anime"; // manga mapped to anime type in DB

    // AniList has no native i18n for descriptions — it always returns English.
    const description = media.description ?? null;

    const result: MediaItem = {
      id: `anilist-${numericId}`,
      source: "anilist",
      type,
      title: media.title.english || media.title.romaji || null,
      originalTitle: media.title.native ?? null,
      year: media.startDate?.year ?? null,
      description,
      score: media.averageScore ?? null,
      popularity: media.popularity ?? null,
      coverImage: media.coverImage?.large ?? null,
      bannerImage: media.bannerImage ?? null,
      genres: media.genres ?? [],
    };

    if (isAnime && media.episodes != null) {
      result.episodes = media.episodes;
    }

    // AniList descriptions are English-only; cache under `en` (empty string when
    // absent, so the locale key is present and we don't refetch on every view).
    const overviews: Record<string, string> = { en: description ?? "" };

    return { item: result, overviews };
  } catch {
    return null;
  }
}

async function cacheMediaItem(item: MediaItem, overviews: Record<string, string>) {
  try {
    await db.insert(mediaItems).values({
      source: item.source,
      sourceId: String(item.id).replace(`${item.source}-`, ""),
      type: item.type === "manga" ? "anime" : item.type,
      title: item.title ?? "Unknown",
      originalTitle: item.originalTitle,
      overview: item.description,
      overviews,
      releaseDate: item.year ? String(item.year) : null,
      posterPath: item.coverImage,
      backdropPath: item.bannerImage,
      genres: item.genres,
      rawData: item as unknown as Record<string, unknown>,
      fetchedAt: new Date(),
    }).onConflictDoUpdate({
      target: [mediaItems.source, mediaItems.sourceId],
      set: {
        title: item.title ?? "Unknown",
        originalTitle: item.originalTitle,
        overview: item.description,
        // Merge the new locale into the existing overviews instead of replacing.
        overviews: sql`coalesce(${mediaItems.overviews}, '{}'::jsonb) || ${JSON.stringify(overviews)}::jsonb`,
        releaseDate: item.year ? String(item.year) : null,
        posterPath: item.coverImage,
        backdropPath: item.bannerImage,
        genres: item.genres,
        rawData: item as unknown as Record<string, unknown>,
        fetchedAt: new Date(),
      },
    });
  } catch {
    // Silently fail caching
  }
}

export async function fetchMediaDetail(id: string, locale: string = "en"): Promise<MediaItem | null> {
  const parsed = parseMediaId(id);
  if (!parsed) return null;

  const { source, sourceId } = parsed;

  // AniList descriptions are English-only, so collapse the locale axis for it.
  const effectiveLocale = source === "anilist" ? "en" : locale;

  // Check cache first — only a hit if we already have this locale's overview.
  const cached = await db.query.mediaItems.findFirst({
    where: and(eq(mediaItems.source, source), eq(mediaItems.sourceId, sourceId)),
  });

  if (
    cached &&
    !isStale(cached.fetchedAt) &&
    cached.overviews != null &&
    effectiveLocale in cached.overviews
  ) {
    return normalizeDbItem(cached, effectiveLocale);
  }

  // Fetch from API
  const fetched = source === "tmdb"
    ? await fetchFromTmdb(sourceId, effectiveLocale)
    : await fetchFromAniList(sourceId);

  if (fetched) {
    await cacheMediaItem(fetched.item, fetched.overviews);
    return fetched.item;
  }

  return null;
}
