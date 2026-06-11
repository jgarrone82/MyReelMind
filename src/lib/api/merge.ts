import type { AniListMedia } from "./anilist/types";

// TMDB types (inline to avoid circular deps)
interface TmdbSearchResponse {
  results: Array<{
    id: number;
    media_type: string;
    title?: string | null;
    name?: string | null;
    original_title?: string | null;
    original_name?: string | null;
    release_date?: string | null;
    first_air_date?: string | null;
    overview?: string | null;
    vote_average?: number | null;
    popularity?: number | null;
    poster_path?: string | null;
    backdrop_path?: string | null;
    genre_ids?: number[];
  }>;
}

// Unified MediaItem schema
export interface MediaItem {
  id: string;
  source: "tmdb" | "anilist";
  type: "movie" | "tv" | "anime" | "manga";
  title: string | null;
  originalTitle: string | null;
  year: number | null;
  description: string | null;
  score: number | null;
  popularity: number | null;
  coverImage: string | null;
  bannerImage: string | null;
  genres: string[];
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function normalizeTmdbResults(response: TmdbSearchResponse | null): MediaItem[] {
  if (!response?.results) return [];

  return response.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => {
      const isMovie = item.media_type === "movie";
      const title = isMovie ? item.title : item.name;
      const originalTitle = isMovie ? item.original_title : item.original_name;
      const date = isMovie ? item.release_date : item.first_air_date;
      const year = date ? parseInt(date.split("-")[0], 10) : null;

      return {
        id: `tmdb-${item.id}`,
        source: "tmdb",
        type: isMovie ? "movie" : "tv",
        title: title ?? null,
        originalTitle: originalTitle ?? null,
        year,
        description: item.overview ?? null,
        score: item.vote_average != null ? Math.round(item.vote_average * 10) : null,
        popularity: item.popularity ?? null,
        coverImage: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
        bannerImage: item.backdrop_path ? `${TMDB_IMAGE_BASE}/original${item.backdrop_path}` : null,
        genres: (item.genre_ids ?? []).map(String),
      };
    });
}

export function normalizeAniListResults(media: AniListMedia[] | null): MediaItem[] {
  if (!media) return [];

  return media.map((item) => {
    const isAnime = item.type === "ANIME";
    const type: "anime" | "manga" = isAnime ? "anime" : "manga";
    
    // Prefer english title, fallback to romaji
    const title = item.title.english || item.title.romaji;
    const originalTitle = item.title.native;

    const result: MediaItem = {
      id: `anilist-${item.id}`,
      source: "anilist",
      type,
      title: title ?? null,
      originalTitle: originalTitle ?? null,
      year: item.startDate.year ?? null,
      description: item.description ?? null,
      score: item.averageScore ?? null,
      popularity: item.popularity ?? null,
      coverImage: item.coverImage.large,
      bannerImage: item.bannerImage ?? null,
      genres: item.genres ?? [],
    };

    // Only include type-specific fields when they have values
    if (isAnime && item.episodes != null) {
      result.episodes = item.episodes;
    }
    if (!isAnime) {
      if (item.chapters != null) {
        result.chapters = item.chapters;
      }
      if (item.volumes != null) {
        result.volumes = item.volumes;
      }
    }

    return result;
  });
}
