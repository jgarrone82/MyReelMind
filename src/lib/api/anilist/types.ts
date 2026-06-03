// AniList GraphQL types

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english?: string | null;
    native?: string | null;
  };
  type: "ANIME" | "MANGA";
  format?: string | null;
  status?: string | null;
  description?: string | null;
  startDate: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  };
  endDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  } | null;
  season?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  genres: string[];
  averageScore?: number | null;
  popularity?: number | null;
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage?: string | null;
}

export interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListMedia[];
    };
  };
}

export interface AniListMediaDetailsResponse {
  data: {
    Media: AniListMedia;
  };
}

export interface AniListSearchParams {
  query?: string;
  type?: "ANIME" | "MANGA";
  page?: number;
  perPage?: number;
}

// Subset of AniList's MediaSort enum used by this client.
export type MediaSort = "TRENDING_DESC";
