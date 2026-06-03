import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTmdbClient } from "./client";
import type { TmdbMovieDetails, TmdbTvDetails } from "./types";
import { server } from "../../../../tests/mocks/server";
import { http, HttpResponse } from "msw";

const API_KEY = "test-api-key";

describe("TMDB Client", () => {
  let client: ReturnType<typeof createTmdbClient>;

  beforeEach(() => {
    client = createTmdbClient({ apiKey: API_KEY, retryDelayMs: 10 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("search", () => {
    it("should call search endpoint with query and page", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/search/multi", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("api_key")).toBe(API_KEY);
          expect(url.searchParams.get("query")).toBe("naruto");
          expect(url.searchParams.get("page")).toBe("1");
          return HttpResponse.json({
            page: 1,
            results: [{ id: 1, title: "Naruto", media_type: "tv" }],
            total_pages: 1,
            total_results: 1,
          });
        })
      );

      const result = await client.search("naruto", 1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].title).toBe("Naruto");
    });

    it("should return empty results when no matches", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/search/multi", () => {
          return HttpResponse.json({
            page: 1,
            results: [],
            total_pages: 0,
            total_results: 0,
          });
        })
      );

      const result = await client.search("xyznonexistent", 1);
      expect(result.results).toHaveLength(0);
      expect(result.total_results).toBe(0);
    });
  });

  describe("trending", () => {
    it("should call the /trending/all/week endpoint with the api key", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/trending/all/week", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("api_key")).toBe(API_KEY);
          return HttpResponse.json({
            page: 1,
            results: [
              { id: 10, media_type: "movie", title: "Trending Movie" },
              { id: 20, media_type: "tv", name: "Trending Show" },
            ],
            total_pages: 1,
            total_results: 2,
          });
        })
      );

      const result = await client.trending();
      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toBe("Trending Movie");
    });
  });

  describe("getDetails", () => {
    it("should fetch movie details by id", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/movie/123", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("api_key")).toBe(API_KEY);
          return HttpResponse.json({
            id: 123,
            title: "Inception",
            overview: "A thief who steals corporate secrets...",
            poster_path: "/poster.jpg",
          });
        })
      );

      const result = await client.getDetails("movie", 123);
      expect(result.id).toBe(123);
      expect((result as TmdbMovieDetails).title).toBe("Inception");
    });

    it("should fetch tv details by id", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/tv/456", () => {
          return HttpResponse.json({
            id: 456,
            name: "Breaking Bad",
            overview: "A high school chemistry teacher...",
          });
        })
      );

      const result = await client.getDetails("tv", 456);
      expect(result.id).toBe(456);
      expect((result as TmdbTvDetails).name).toBe("Breaking Bad");
    });

    it("should append the language param when provided", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/movie/123", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("language")).toBe("es-ES");
          return HttpResponse.json({ id: 123, title: "El origen" });
        })
      );

      const result = await client.getDetails("movie", 123, { language: "es-ES" });
      expect(result.id).toBe(123);
    });

    it("should omit the language param when not provided", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/movie/123", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.has("language")).toBe(false);
          return HttpResponse.json({ id: 123, title: "Inception" });
        })
      );

      const result = await client.getDetails("movie", 123);
      expect(result.id).toBe(123);
    });
  });

  describe("getConfiguration", () => {
    it("should fetch TMDB configuration", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/configuration", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("api_key")).toBe(API_KEY);
          return HttpResponse.json({
            images: {
              base_url: "https://image.tmdb.org/t/p/",
              secure_base_url: "https://image.tmdb.org/t/p/",
              poster_sizes: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
            },
          });
        })
      );

      const result = await client.getConfiguration();
      expect(result.images.base_url).toBe("https://image.tmdb.org/t/p/");
    });
  });

  describe("retry on transient errors", () => {
    it("should retry up to 3 times on 5xx errors", async () => {
      let attempts = 0;
      server.use(
        http.get("https://api.themoviedb.org/3/movie/999", () => {
          attempts++;
          if (attempts < 3) {
            return new HttpResponse(null, { status: 503 });
          }
          return HttpResponse.json({ id: 999, title: "Recovered" });
        })
      );

      const result = await client.getDetails("movie", 999);
      expect(attempts).toBe(3);
      expect((result as TmdbMovieDetails).title).toBe("Recovered");
    });

    it("should throw after exhausting retries", async () => {
      server.use(
        http.get("https://api.themoviedb.org/3/movie/888", () => {
          return new HttpResponse(null, { status: 502 });
        })
      );

      await expect(client.getDetails("movie", 888)).rejects.toThrow();
    });
  });
});
