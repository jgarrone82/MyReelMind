import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchMedia } from "./service";
import { server } from "../../../tests/mocks/server";
import { http, HttpResponse } from "msw";

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoUpdate: vi.fn(() => Promise.resolve()),
      })),
    })),
  },
}));

describe("searchMedia", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("should merge TMDB and AniList results", async () => {
    server.use(
      http.get("https://api.themoviedb.org/3/search/multi", () => {
        return HttpResponse.json({
          page: 1,
          results: [
            {
              id: 1,
              media_type: "movie",
              title: "TMDB Movie",
              poster_path: "/1.jpg",
              backdrop_path: null,
              genre_ids: [],
              release_date: "2020-01-01",
              overview: "A movie",
              vote_average: 7.5,
              popularity: 100,
            },
          ],
          total_pages: 1,
          total_results: 1,
        });
      }),
      http.post("https://graphql.anilist.co", () => {
        return HttpResponse.json({
          data: {
            Page: {
              media: [
                {
                  id: 2,
                  title: { romaji: "AniList Anime", english: null, native: "アニメ" },
                  type: "ANIME",
                  coverImage: { large: "https://anilist.com/2.jpg", medium: "https://anilist.com/2m.jpg" },
                  genres: [],
                  startDate: { year: 2021 },
                },
              ],
            },
          },
        });
      })
    );

    const { results } = await searchMedia("test", { page: 1, type: "all" });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.source)).toEqual(["tmdb", "anilist"]);
  });

  it("should return TMDB-only when AniList fails", async () => {
    server.use(
      http.get("https://api.themoviedb.org/3/search/multi", () => {
        return HttpResponse.json({
          page: 1,
          results: [{ id: 1, media_type: "movie", title: "Only TMDB", poster_path: null, backdrop_path: null, genre_ids: [], release_date: null, overview: null, vote_average: 0, popularity: 0 }],
          total_pages: 1,
          total_results: 1,
        });
      }),
      http.post("https://graphql.anilist.co", () => {
        return new HttpResponse(null, { status: 429 });
      })
    );

    const { results } = await searchMedia("test", { page: 1, type: "all" });
    expect(results).toHaveLength(1);
    expect(results[0].source).toBe("tmdb");
  });

  it("should filter by type=anime", async () => {
    server.use(
      http.get("https://api.themoviedb.org/3/search/multi", () => {
        return HttpResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
      }),
      http.post("https://graphql.anilist.co", () => {
        return HttpResponse.json({
          data: {
            Page: {
              media: [
                {
                  id: 1,
                  title: { romaji: "Anime", english: null, native: "アニメ" },
                  type: "ANIME",
                  coverImage: { large: "https://anilist.com/1.jpg", medium: "https://anilist.com/1m.jpg" },
                  genres: [],
                  startDate: { year: 2020 },
                },
              ],
            },
          },
        });
      })
    );

    const { results } = await searchMedia("anime", { page: 1, type: "anime" });
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe("anime");
  });
});
