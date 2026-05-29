import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMediaDetail } from "./detail";

vi.mock("@/db", () => ({
  db: {
    query: {
      mediaItems: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock("@/lib/api/tmdb/client", () => ({
  createTmdbClient: vi.fn(() => ({
    getDetails: vi.fn(),
  })),
}));

vi.mock("@/lib/api/anilist/client", () => ({
  createAniListClient: vi.fn(() => ({
    getMediaById: vi.fn(),
  })),
}));

import { db } from "@/db";
import { createTmdbClient } from "@/lib/api/tmdb/client";
import { createAniListClient } from "@/lib/api/anilist/client";

describe("fetchMediaDetail", () => {
  const mockTmdbGetDetails = vi.fn();
  const mockAnilistGetMediaById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createTmdbClient).mockReturnValue({ getDetails: mockTmdbGetDetails } as unknown as ReturnType<typeof createTmdbClient>);
    vi.mocked(createAniListClient).mockReturnValue({ getMediaById: mockAnilistGetMediaById } as unknown as ReturnType<typeof createAniListClient>);
  });

  it("should return cached media from database when fresh", async () => {
    const cachedItem = {
      id: "uuid-1",
      source: "tmdb" as const,
      sourceId: "123",
      type: "movie" as const,
      title: "Inception",
      originalTitle: "Inception",
      overview: "A mind-bending thriller",
      overviews: { en: "A mind-bending thriller" },
      releaseDate: "2010-07-16",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      genres: ["Sci-Fi", "Action"],
      runtime: 148,
      status: null,
      rawData: null,
      fetchedAt: new Date(),
      createdAt: new Date(),
    };

    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(cachedItem);

    const result = await fetchMediaDetail("tmdb-123");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Inception");
    expect(result?.source).toBe("tmdb");
    expect(mockTmdbGetDetails).not.toHaveBeenCalled();
  });

  it("should fetch from TMDB API when not cached", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
    mockTmdbGetDetails.mockResolvedValue({
      id: 123,
      title: "Inception",
      original_title: "Inception",
      overview: "A mind-bending thriller",
      release_date: "2010-07-16",
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      genre_ids: [878, 28],
      vote_average: 8.8,
      popularity: 100,
      media_type: "movie",
    });

    const result = await fetchMediaDetail("tmdb-123");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Inception");
    expect(mockTmdbGetDetails).toHaveBeenCalledWith("movie", 123, { language: "en-US" });
  });

  it("should fetch from AniList API when not cached", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
    mockAnilistGetMediaById.mockResolvedValue({
      id: 456,
      title: { english: "Attack on Titan", romaji: "Shingeki no Kyojin", native: "進撃の巨人" },
      description: "Humanity fights titans",
      startDate: { year: 2013 },
      coverImage: { large: "https://example.com/cover.jpg" },
      bannerImage: "https://example.com/banner.jpg",
      genres: ["Action", "Drama"],
      averageScore: 92,
      popularity: 200,
      type: "ANIME",
      episodes: 25,
    });

    const result = await fetchMediaDetail("anilist-456");

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Attack on Titan");
    expect(result?.type).toBe("anime");
    expect(mockAnilistGetMediaById).toHaveBeenCalledWith(456);
  });

  it("should return null for invalid id format", async () => {
    const result = await fetchMediaDetail("invalid");
    expect(result).toBeNull();
  });

  it("should refetch when cache is stale (>1 hour)", async () => {
    const staleItem = {
      id: "uuid-1",
      source: "tmdb" as const,
      sourceId: "123",
      type: "movie" as const,
      title: "Old Title",
      originalTitle: "Old Title",
      overview: "Old overview",
      overviews: null,
      releaseDate: "2010-07-16",
      posterPath: "/old.jpg",
      backdropPath: null,
      genres: [],
      runtime: null,
      status: null,
      rawData: null,
      fetchedAt: new Date(Date.now() - 1000 * 60 * 61), // 61 minutes ago
      createdAt: new Date(),
    };

    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(staleItem);
    mockTmdbGetDetails.mockResolvedValue({
      id: 123,
      title: "New Title",
      original_title: "New Title",
      overview: "New overview",
      release_date: "2010-07-16",
      poster_path: "/new.jpg",
      backdrop_path: null,
      genre_ids: [],
      vote_average: 8.8,
      popularity: 100,
      media_type: "movie",
    });

    const result = await fetchMediaDetail("tmdb-123");

    expect(result?.title).toBe("New Title");
    expect(mockTmdbGetDetails).toHaveBeenCalled();
  });

  it("should pass the user locale to TMDB as a language tag", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
    mockTmdbGetDetails.mockResolvedValue({
      id: 123,
      title: "El origen",
      overview: "Un ladron que roba secretos corporativos...",
      release_date: "2010-07-16",
      media_type: "movie",
    });

    const result = await fetchMediaDetail("tmdb-123", "es");

    expect(result?.description).toBe("Un ladron que roba secretos corporativos...");
    expect(mockTmdbGetDetails).toHaveBeenCalledWith("movie", 123, { language: "es-ES" });
  });

  it("should serve the cached overview for the requested locale without hitting the API", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue({
      id: "uuid-1",
      source: "tmdb" as const,
      sourceId: "123",
      type: "movie" as const,
      title: "Inception",
      originalTitle: "Inception",
      overview: "A mind-bending thriller",
      overviews: { en: "A mind-bending thriller", es: "Un thriller alucinante" },
      releaseDate: "2010-07-16",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      genres: ["Sci-Fi"],
      runtime: 148,
      status: null,
      rawData: null,
      fetchedAt: new Date(),
      createdAt: new Date(),
    });

    const result = await fetchMediaDetail("tmdb-123", "es");

    expect(result?.description).toBe("Un thriller alucinante");
    expect(mockTmdbGetDetails).not.toHaveBeenCalled();
  });

  it("should refetch when the requested locale is missing from the cached overviews", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue({
      id: "uuid-1",
      source: "tmdb" as const,
      sourceId: "123",
      type: "movie" as const,
      title: "Inception",
      originalTitle: "Inception",
      overview: "A mind-bending thriller",
      overviews: { en: "A mind-bending thriller" },
      releaseDate: "2010-07-16",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      genres: ["Sci-Fi"],
      runtime: 148,
      status: null,
      rawData: null,
      fetchedAt: new Date(),
      createdAt: new Date(),
    });
    mockTmdbGetDetails.mockResolvedValue({
      id: 123,
      title: "El origen",
      overview: "Un thriller alucinante",
      release_date: "2010-07-16",
      media_type: "movie",
    });

    const result = await fetchMediaDetail("tmdb-123", "es");

    expect(result?.description).toBe("Un thriller alucinante");
    expect(mockTmdbGetDetails).toHaveBeenCalledWith("movie", 123, { language: "es-ES" });
  });

  it("should serve the English fallback from cache without refetching when the locale overview is empty", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue({
      id: "uuid-1",
      source: "tmdb" as const,
      sourceId: "123",
      type: "movie" as const,
      title: "Inception",
      originalTitle: "Inception",
      overview: "A mind-bending thriller",
      overviews: { en: "A mind-bending thriller", es: "" },
      releaseDate: "2010-07-16",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      genres: ["Sci-Fi"],
      runtime: 148,
      status: null,
      rawData: null,
      fetchedAt: new Date(),
      createdAt: new Date(),
    });

    const result = await fetchMediaDetail("tmdb-123", "es");

    expect(result?.description).toBe("A mind-bending thriller");
    expect(mockTmdbGetDetails).not.toHaveBeenCalled();
  });

  it("should always request English for AniList regardless of locale", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
    mockAnilistGetMediaById.mockResolvedValue({
      id: 456,
      title: { english: "Attack on Titan", romaji: "Shingeki no Kyojin", native: "進撃の巨人" },
      description: "Humanity fights titans",
      startDate: { year: 2013 },
      coverImage: { large: "https://example.com/cover.jpg" },
      genres: ["Action"],
      averageScore: 92,
      popularity: 200,
      type: "ANIME",
    });

    const result = await fetchMediaDetail("anilist-456", "es");

    expect(result?.description).toBe("Humanity fights titans");
    expect(mockAnilistGetMediaById).toHaveBeenCalledWith(456);
  });

  it("should fall back to English when TMDB has no overview in the requested locale", async () => {
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
    mockTmdbGetDetails
      .mockResolvedValueOnce({
        id: 123,
        title: "El origen",
        overview: "",
        release_date: "2010-07-16",
        media_type: "movie",
      })
      .mockResolvedValueOnce({
        id: 123,
        title: "Inception",
        overview: "A mind-bending thriller",
        release_date: "2010-07-16",
        media_type: "movie",
      });

    const result = await fetchMediaDetail("tmdb-123", "es");

    expect(result?.description).toBe("A mind-bending thriller");
    expect(mockTmdbGetDetails).toHaveBeenNthCalledWith(1, "movie", 123, { language: "es-ES" });
    expect(mockTmdbGetDetails).toHaveBeenNthCalledWith(2, "movie", 123, { language: "en-US" });
  });
});
