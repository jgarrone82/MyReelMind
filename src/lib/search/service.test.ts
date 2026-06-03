import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchMedia, getTrending } from "./service";
import { db } from "@/db";
import { server } from "../../../tests/mocks/server";
import { http, HttpResponse } from "msw";

const insertSpy = vi.fn(() => ({
  values: vi.fn(() => ({
    onConflictDoUpdate: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock("@/db", () => ({
  db: {
    insert: () => insertSpy(),
  },
}));

const TMDB_TRENDING = "https://api.themoviedb.org/3/trending/all/week";
const ANILIST_URL = "https://graphql.anilist.co";

function tmdbItem(id: number, title: string, mediaType = "movie") {
  return {
    id,
    media_type: mediaType,
    title,
    name: title,
    poster_path: "/p.jpg",
    backdrop_path: null,
    genre_ids: [],
    release_date: "2024-01-01",
    first_air_date: "2024-01-01",
    overview: "overview",
    vote_average: 8,
    popularity: 100,
  };
}

function anilistItem(id: number, romaji: string) {
  return {
    id,
    title: { romaji, english: null, native: "ネイティブ" },
    type: "ANIME",
    coverImage: { large: `https://anilist.com/${id}.jpg`, medium: `https://anilist.com/${id}m.jpg` },
    genres: [],
    startDate: { year: 2024 },
  };
}

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

describe("getTrending", () => {
  beforeEach(() => {
    server.resetHandlers();
    insertSpy.mockClear();
  });

  it("interleaves both sources and caps the merged result at 15", async () => {
    server.use(
      http.get(TMDB_TRENDING, () =>
        HttpResponse.json({
          page: 1,
          results: Array.from({ length: 12 }, (_, i) => tmdbItem(i + 1, `TMDB ${i + 1}`, "movie")),
          total_pages: 1,
          total_results: 12,
        })
      ),
      http.post(ANILIST_URL, () =>
        HttpResponse.json({
          data: { Page: { media: Array.from({ length: 12 }, (_, i) => anilistItem(i + 1, `Anime ${i + 1}`)) } },
        })
      )
    );

    const { results } = await getTrending();
    expect(results).toHaveLength(15);
  });

  it("alternates TMDB, AniList, TMDB in the merged order", async () => {
    server.use(
      http.get(TMDB_TRENDING, () =>
        HttpResponse.json({
          page: 1,
          results: [tmdbItem(1, "TMDB A"), tmdbItem(2, "TMDB B")],
          total_pages: 1,
          total_results: 2,
        })
      ),
      http.post(ANILIST_URL, () =>
        HttpResponse.json({ data: { Page: { media: [anilistItem(1, "Anime A"), anilistItem(2, "Anime B")] } } })
      )
    );

    const { results } = await getTrending();
    expect(results.map((r) => r.source)).toEqual(["tmdb", "anilist", "tmdb", "anilist"]);
  });

  it("returns TMDB items only when AniList rejects", async () => {
    server.use(
      http.get(TMDB_TRENDING, () =>
        HttpResponse.json({
          page: 1,
          results: [tmdbItem(1, "Only TMDB")],
          total_pages: 1,
          total_results: 1,
        })
      ),
      http.post(ANILIST_URL, () => new HttpResponse(null, { status: 429 }))
    );

    const { results } = await getTrending();
    expect(results).toHaveLength(1);
    expect(results[0].source).toBe("tmdb");
  });

  it("returns AniList items only when TMDB rejects", async () => {
    server.use(
      http.get(TMDB_TRENDING, () => new HttpResponse(null, { status: 404 })),
      http.post(ANILIST_URL, () =>
        HttpResponse.json({ data: { Page: { media: [anilistItem(1, "Only Anime")] } } })
      )
    );

    const { results } = await getTrending();
    expect(results).toHaveLength(1);
    expect(results[0].source).toBe("anilist");
  });

  it("returns an empty array (no throw) when both sources reject", async () => {
    server.use(
      http.get(TMDB_TRENDING, () => new HttpResponse(null, { status: 404 })),
      http.post(ANILIST_URL, () => new HttpResponse(null, { status: 429 }))
    );

    const { results } = await getTrending();
    expect(results).toEqual([]);
  });

  it("excludes media_type: person entries from the trending result", async () => {
    server.use(
      http.get(TMDB_TRENDING, () =>
        HttpResponse.json({
          page: 1,
          results: [
            tmdbItem(1, "Real Movie", "movie"),
            { id: 2, media_type: "person", name: "Some Actor", profile_path: "/a.jpg" },
          ],
          total_pages: 1,
          total_results: 2,
        })
      ),
      http.post(ANILIST_URL, () => HttpResponse.json({ data: { Page: { media: [] } } }))
    );

    const { results } = await getTrending();
    expect(results).toHaveLength(1);
    expect(results.some((r) => r.title === "Some Actor")).toBe(false);
    expect(results[0].title).toBe("Real Movie");
  });

  it("does NOT persist trending results to the search-results DB cache", async () => {
    server.use(
      http.get(TMDB_TRENDING, () =>
        HttpResponse.json({
          page: 1,
          results: [tmdbItem(1, "TMDB One")],
          total_pages: 1,
          total_results: 1,
        })
      ),
      http.post(ANILIST_URL, () =>
        HttpResponse.json({ data: { Page: { media: [anilistItem(1, "Anime One")] } } })
      )
    );

    await getTrending();
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
