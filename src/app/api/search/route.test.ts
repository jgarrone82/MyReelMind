import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/search/service", () => ({
  searchMedia: vi.fn(async (query: string, options: { type?: string }) => {
    if (query === "empty") return [];
    return [
      {
        id: "tmdb-1",
        source: "tmdb",
        type: options.type === "anime" ? "anime" : "movie",
        title: "Test Movie",
        originalTitle: null,
        year: 2020,
        description: "A test movie",
        score: 80,
        popularity: 100,
        coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
        bannerImage: null,
        genres: ["Action"],
      },
    ];
  }),
}));

describe("GET /api/search", () => {
  it("should return search results for query", async () => {
    const req = new Request("http://localhost:3000/api/search?q=naruto");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(1);
    expect(json.results[0].title).toBe("Test Movie");
  });

  it("should return empty array for no query", async () => {
    const req = new Request("http://localhost:3000/api/search");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toEqual([]);
  });

  it("should pass type filter", async () => {
    const req = new Request("http://localhost:3000/api/search?q=naruto&type=anime");
    const res = await GET(req);
    const json = await res.json();
    expect(json.results[0].type).toBe("anime");
  });
});
