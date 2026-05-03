import { db } from "@/db";
import { mediaItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createTmdbClient } from "@/lib/api/tmdb/client";
import { createAniListClient } from "@/lib/api/anilist/client";
import { AniListQueue } from "@/lib/api/anilist/queue";
import type { MediaItem } from "@/lib/api/merge";

const STALE_THRESHOLD_MS = 1000 * 60 * 60; // 1 hour

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

function parseMediaId(id: string): { source: "tmdb" | "anilist"; sourceId: string } | null {
  if (id.startsWith("tmdb-")) {
    return { source: "tmdb", sourceId: id.replace("tmdb-", "") };
  }
  if (id.startsWith("anilist-")) {
    return { source: "anilist", sourceId: id.replace("anilist-", "") };
  }
  return null;
}

function normalizeDbItem(item: typeof mediaItems.$inferSelect): MediaItem {
  const sourceId = item.sourceId;
  const id = `${item.source}-${sourceId}`;

  return {
    id,
    source: item.source,
    type: item.type,
    title: item.title,
    originalTitle: item.originalTitle ?? null,
    year: item.releaseDate ? parseInt(item.releaseDate, 10) : null,
    description: item.overview ?? null,
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

async function fetchFromTmdb(sourceId: string): Promise<MediaItem | null> {
  try {
    const numericId = parseInt(sourceId, 10);
    if (isNaN(numericId)) return null;

    const tmdbClient = getTmdbClient();

    // Try movie first, then TV
    let details = await tmdbClient.getDetails("movie", numericId).catch(() => null);
    let type: "movie" | "tv" = "movie";

    if (!details) {
      details = await tmdbClient.getDetails("tv", numericId).catch(() => null);
      type = "tv";
    }

    if (!details) return null;

    const title = type === "movie" ? details.title : details.name;
    const originalTitle = type === "movie" ? details.original_title : details.original_name;
    const date = type === "movie" ? details.release_date : details.first_air_date;
    const year = date ? parseInt(date.split("-")[0], 10) : null;

    return {
      id: `tmdb-${numericId}`,
      source: "tmdb",
      type,
      title: title ?? null,
      originalTitle: originalTitle ?? null,
      year,
      description: details.overview ?? null,
      score: details.vote_average != null ? Math.round(details.vote_average * 10) : null,
      popularity: details.popularity ?? null,
      coverImage: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      bannerImage: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
      genres: details.genre_ids ?? [],
    };
  } catch {
    return null;
  }
}

async function fetchFromAniList(sourceId: string): Promise<MediaItem | null> {
  try {
    const numericId = parseInt(sourceId, 10);
    if (isNaN(numericId)) return null;

    const anilistClient = getAniListClient();
    const media = await anilistClient.getMediaById(numericId);
    if (!media) return null;

    const isAnime = media.type === "ANIME";
    const type = isAnime ? "anime" : "anime"; // manga mapped to anime type in DB

    const result: MediaItem = {
      id: `anilist-${numericId}`,
      source: "anilist",
      type,
      title: media.title.english || media.title.romaji || null,
      originalTitle: media.title.native ?? null,
      year: media.startDate?.year ?? null,
      description: media.description ?? null,
      score: media.averageScore ?? null,
      popularity: media.popularity ?? null,
      coverImage: media.coverImage?.large ?? null,
      bannerImage: media.bannerImage ?? null,
      genres: media.genres ?? [],
    };

    if (isAnime && media.episodes != null) {
      result.episodes = media.episodes;
    }

    return result;
  } catch {
    return null;
  }
}

async function cacheMediaItem(item: MediaItem) {
  try {
    await db.insert(mediaItems).values({
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
    }).onConflictDoUpdate({
      target: [mediaItems.source, mediaItems.sourceId],
      set: {
        title: item.title ?? "Unknown",
        originalTitle: item.originalTitle,
        overview: item.description,
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

export async function fetchMediaDetail(id: string): Promise<MediaItem | null> {
  const parsed = parseMediaId(id);
  if (!parsed) return null;

  const { source, sourceId } = parsed;

  // Check cache first
  const cached = await db.query.mediaItems.findFirst({
    where: and(eq(mediaItems.source, source), eq(mediaItems.sourceId, sourceId)),
  });

  if (cached && !isStale(cached.fetchedAt)) {
    return normalizeDbItem(cached);
  }

  // Fetch from API
  const item = source === "tmdb"
    ? await fetchFromTmdb(sourceId)
    : await fetchFromAniList(sourceId);

  if (item) {
    await cacheMediaItem(item);
  }

  return item;
}
