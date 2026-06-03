import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAniListClient } from "./client";
import { AniListQueue } from "./queue";

describe("AniList GraphQL Client", () => {
  let mockQueue: AniListQueue;
  let client: ReturnType<typeof createAniListClient>;

  beforeEach(() => {
    mockQueue = new AniListQueue();
    client = createAniListClient({
      queue: mockQueue,
    });
  });

  describe("search", () => {
    it("should search anime by query", async () => {
      const mockResponse = {
        data: {
          Page: {
            media: [
              {
                id: 1,
                title: { romaji: "Test Anime", english: "Test Anime EN" },
                type: "ANIME" as const,
                genres: ["Action"],
                averageScore: 80,
                coverImage: { large: "https://example.com/image.jpg", medium: "https://example.com/image_medium.jpg" },
                startDate: { year: 2020, month: 1, day: 1 },
                episodes: 12,
              },
            ],
          },
        },
      };

      const executeSpy = vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.search({ query: "test", type: "ANIME" });

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data.Page.media);
    });

    it("should search manga by query", async () => {
      const mockResponse = {
        data: {
          Page: {
            media: [
              {
                id: 2,
                title: { romaji: "Test Manga" },
                type: "MANGA" as const,
                genres: ["Drama"],
                coverImage: { large: "https://example.com/manga.jpg", medium: "https://example.com/manga_medium.jpg" },
                startDate: { year: 2019 },
                chapters: 100,
              },
            ],
          },
        },
      };

      vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.search({ query: "test", type: "MANGA" });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("MANGA");
    });

    it("should handle empty search results", async () => {
      const mockResponse = {
        data: {
          Page: {
            media: [],
          },
        },
      };

      vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.search({ query: "nonexistent" });

      expect(result).toEqual([]);
    });

    it("should use default perPage of 10", async () => {
      const mockResponse = { data: { Page: { media: [] } } };
      const executeSpy = vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      await client.search({ query: "test" });

      expect(executeSpy).toHaveBeenCalledWith(
        expect.stringContaining('"perPage":10'),
        expect.any(Function)
      );
    });
  });

  describe("trending", () => {
    it("should request TRENDING_DESC anime with the given perPage", async () => {
      const mockResponse = {
        data: {
          Page: {
            media: [
              {
                id: 99,
                title: { romaji: "Trending Anime", english: "Trending Anime EN" },
                type: "ANIME" as const,
                genres: ["Action"],
                coverImage: { large: "https://example.com/t.jpg", medium: "https://example.com/tm.jpg" },
                startDate: { year: 2024 },
              },
            ],
          },
        },
      };

      const executeSpy = vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.trending(15);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      const [key, fn] = executeSpy.mock.calls[0];
      expect(key).toContain('"sort":["TRENDING_DESC"]');
      expect(key).toContain('"type":"ANIME"');
      expect(key).toContain('"perPage":15');
      expect(typeof fn).toBe("function");
      expect(result).toEqual(mockResponse.data.Page.media);
    });

    it("should default perPage to 15", async () => {
      const mockResponse = { data: { Page: { media: [] } } };
      const executeSpy = vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      await client.trending();

      expect(executeSpy).toHaveBeenCalledWith(
        expect.stringContaining('"perPage":15'),
        expect.any(Function)
      );
    });
  });

  describe("getMediaById", () => {
    it("should fetch media details by ID", async () => {
      const mockResponse = {
        data: {
          Media: {
            id: 123,
            title: { romaji: "Detailed Anime", english: "Detailed Anime EN" },
            type: "ANIME" as const,
            genres: ["Action", "Adventure"],
            averageScore: 85,
            popularity: 10000,
            coverImage: { large: "https://example.com/detail.jpg", medium: "https://example.com/detail_medium.jpg" },
            startDate: { year: 2021, month: 4, day: 15 },
            episodes: 24,
            description: "A great anime",
            status: "FINISHED",
          },
        },
      };

      const executeSpy = vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.getMediaById(123);

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data.Media);
    });

    it("should handle null fields gracefully", async () => {
      const mockResponse = {
        data: {
          Media: {
            id: 456,
            title: { romaji: "Minimal Anime", english: null },
            type: "ANIME" as const,
            genres: [],
            averageScore: null,
            coverImage: { large: "https://example.com/minimal.jpg", medium: "https://example.com/minimal_medium.jpg" },
            startDate: { year: null, month: null, day: null },
            episodes: null,
          },
        },
      };

      vi.spyOn(mockQueue, "execute").mockResolvedValue(mockResponse);

      const result = await client.getMediaById(456);

      expect(result.id).toBe(456);
      expect(result.averageScore).toBeNull();
      expect(result.episodes).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should propagate queue errors", async () => {
      const error = new Error("Rate limited");
      (error as any).status = 429;
      vi.spyOn(mockQueue, "execute").mockRejectedValue(error);

      await expect(client.search({ query: "test" })).rejects.toThrow("Rate limited");
    });
  });
});
