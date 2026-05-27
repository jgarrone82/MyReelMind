import { describe, it, expect } from "vitest";
import { normalizeTmdbResults, normalizeAniListResults, mergeSearchResults } from "./merge";

describe("Search Normalizer", () => {
  describe("normalizeTmdbResults", () => {
    it("should normalize TMDB movie to unified MediaItem", () => {
      const tmdbResults = {
        results: [
          {
            id: 123,
            media_type: "movie",
            title: "Test Movie",
            original_title: "Película de Prueba",
            release_date: "2020-05-15",
            overview: "A great movie",
            vote_average: 7.5,
            popularity: 100,
            poster_path: "/poster.jpg",
            backdrop_path: "/backdrop.jpg",
            genre_ids: [28, 12],
          },
        ],
      };

      const normalized = normalizeTmdbResults(tmdbResults as any);

      expect(normalized).toHaveLength(1);
      expect(normalized[0]).toEqual({
        id: "tmdb-123",
        source: "tmdb",
        type: "movie",
        title: "Test Movie",
        originalTitle: "Película de Prueba",
        year: 2020,
        description: "A great movie",
        score: 75,
        popularity: 100,
        coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
        bannerImage: "https://image.tmdb.org/t/p/original/backdrop.jpg",
        genres: ["28", "12"],
      });
    });

    it("should normalize TMDB TV show to unified MediaItem", () => {
      const tmdbResults = {
        results: [
          {
            id: 456,
            media_type: "tv",
            name: "Test Series",
            original_name: "Serie de Prueba",
            first_air_date: "2019-01-01",
            overview: "A great series",
            vote_average: 8.2,
            popularity: 200,
            poster_path: "/series.jpg",
            backdrop_path: null,
            genre_ids: [18],
          },
        ],
      };

      const normalized = normalizeTmdbResults(tmdbResults as any);

      expect(normalized[0]).toEqual({
        id: "tmdb-456",
        source: "tmdb",
        type: "tv",
        title: "Test Series",
        originalTitle: "Serie de Prueba",
        year: 2019,
        description: "A great series",
        score: 82,
        popularity: 200,
        coverImage: "https://image.tmdb.org/t/p/w500/series.jpg",
        bannerImage: null,
        genres: ["18"],
      });
    });

    it("should handle missing fields gracefully", () => {
      const tmdbResults = {
        results: [
          {
            id: 789,
            media_type: "movie",
            title: "Minimal Movie",
            release_date: null,
            overview: null,
            vote_average: 0,
            popularity: 0,
            poster_path: null,
            backdrop_path: null,
            genre_ids: [],
          },
        ],
      };

      const normalized = normalizeTmdbResults(tmdbResults as any);

      expect(normalized[0]).toEqual({
        id: "tmdb-789",
        source: "tmdb",
        type: "movie",
        title: "Minimal Movie",
        originalTitle: null,
        year: null,
        description: null,
        score: 0,
        popularity: 0,
        coverImage: null,
        bannerImage: null,
        genres: [],
      });
    });

    it("should filter out non-movie/tv results", () => {
      const tmdbResults = {
        results: [
          { id: 1, media_type: "movie", title: "Movie" },
          { id: 2, media_type: "person", name: "Actor" },
          { id: 3, media_type: "tv", name: "Series" },
        ],
      };

      const normalized = normalizeTmdbResults(tmdbResults as any);

      expect(normalized).toHaveLength(2);
      expect(normalized.map((i) => i.type)).toEqual(["movie", "tv"]);
    });
  });

  describe("normalizeAniListResults", () => {
    it("should normalize AniList anime to unified MediaItem", () => {
      const aniListResults = [
        {
          id: 100,
          title: { romaji: "Test Anime", english: "Test Anime EN", native: "テストアニメ" },
          type: "ANIME" as const,
          format: "TV",
          status: "FINISHED",
          description: "A great anime",
          startDate: { year: 2021, month: 4, day: 1 },
          episodes: 12,
          averageScore: 85,
          popularity: 5000,
          genres: ["Action", "Adventure"],
          coverImage: { large: "https://example.com/large.jpg", medium: "https://example.com/medium.jpg" },
          bannerImage: "https://example.com/banner.jpg",
        },
      ];

      const normalized = normalizeAniListResults(aniListResults as any);

      expect(normalized).toHaveLength(1);
      expect(normalized[0]).toEqual({
        id: "anilist-100",
        source: "anilist",
        type: "anime",
        title: "Test Anime EN",
        originalTitle: "テストアニメ",
        year: 2021,
        description: "A great anime",
        score: 85,
        popularity: 5000,
        coverImage: "https://example.com/large.jpg",
        bannerImage: "https://example.com/banner.jpg",
        genres: ["Action", "Adventure"],
        episodes: 12,
      });
    });

    it("should normalize AniList manga to unified MediaItem", () => {
      const aniListResults = [
        {
          id: 200,
          title: { romaji: "Test Manga", english: null, native: "テストマンガ" },
          type: "MANGA" as const,
          format: "MANGA",
          description: "A great manga",
          startDate: { year: 2020 },
          chapters: 50,
          averageScore: 90,
          popularity: 3000,
          genres: ["Drama"],
          coverImage: { large: "https://example.com/manga.jpg", medium: "https://example.com/manga_medium.jpg" },
        },
      ];

      const normalized = normalizeAniListResults(aniListResults as any);

      expect(normalized[0]).toEqual({
        id: "anilist-200",
        source: "anilist",
        type: "manga",
        title: "Test Manga",
        originalTitle: "テストマンガ",
        year: 2020,
        description: "A great manga",
        score: 90,
        popularity: 3000,
        coverImage: "https://example.com/manga.jpg",
        bannerImage: null,
        genres: ["Drama"],
        chapters: 50,
      });
    });

    it("should use romaji title when english is null", () => {
      const aniListResults = [
        {
          id: 300,
          title: { romaji: "Only Romaji", english: null, native: "ネイティブ" },
          type: "ANIME" as const,
          coverImage: { large: "https://example.com/romaji.jpg", medium: "https://example.com/romaji_medium.jpg" },
          genres: [],
          startDate: { year: 2019 },
        },
      ];

      const normalized = normalizeAniListResults(aniListResults as any);

      expect(normalized[0].title).toBe("Only Romaji");
      expect(normalized[0].originalTitle).toBe("ネイティブ");
    });
  });

  describe("mergeSearchResults", () => {
    it("should merge TMDB and AniList results", () => {
      const tmdbResults = {
        results: [
          { id: 1, media_type: "movie", title: "TMDB Movie", poster_path: "/1.jpg", backdrop_path: null, genre_ids: [] },
        ],
      };
      const aniListResults = [
        {
          id: 2,
          title: { romaji: "AniList Anime", english: null },
          type: "ANIME" as const,
          coverImage: { large: "https://anilist.com/2.jpg", medium: "https://anilist.com/2_medium.jpg" },
          genres: [],
          startDate: { year: 2020 },
        },
      ];

      const merged = mergeSearchResults(tmdbResults as any, aniListResults as any);

      expect(merged).toHaveLength(2);
      expect(merged.map((i) => i.source)).toEqual(["tmdb", "anilist"]);
    });

    it("should handle TMDB failure gracefully", () => {
      const aniListResults = [
        {
          id: 2,
          title: { romaji: "Only AniList", english: null },
          type: "ANIME" as const,
          coverImage: { large: "https://anilist.com/2.jpg", medium: "https://anilist.com/2_medium.jpg" },
          genres: [],
          startDate: { year: 2020 },
        },
      ];

      const merged = mergeSearchResults(null, aniListResults as any);

      expect(merged).toHaveLength(1);
      expect(merged[0].source).toBe("anilist");
    });

    it("should handle AniList failure gracefully", () => {
      const tmdbResults = {
        results: [
          { id: 1, media_type: "movie", title: "Only TMDB", poster_path: "/1.jpg", backdrop_path: null, genre_ids: [] },
        ],
      };

      const merged = mergeSearchResults(tmdbResults as any, null);

      expect(merged).toHaveLength(1);
      expect(merged[0].source).toBe("tmdb");
    });

    it("should return empty array when both fail", () => {
      const merged = mergeSearchResults(null, null);
      expect(merged).toEqual([]);
    });
  });
});
