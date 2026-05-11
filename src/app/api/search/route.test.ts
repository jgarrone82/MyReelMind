import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/search/service", () => ({
  searchMedia: vi.fn(async (query: string, options: { type?: string; page?: number }) => {
    if (query === "empty") return { results: [], totalPages: 0 };
    return {
      results: [
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
      ],
      totalPages: 5,
    };
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
    expect(json.page).toBe(1);
    expect(json.totalPages).toBe(5);
  });

  it("should return empty array for no query", async () => {
    const req = new Request("http://localhost:3000/api/search");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toEqual([]);
    expect(json.page).toBe(1);
    expect(json.totalPages).toBe(0);
  });

  it("should pass type filter", async () => {
    const req = new Request("http://localhost:3000/api/search?q=naruto&type=anime");
    const res = await GET(req);
    const json = await res.json();
    expect(json.results[0].type).toBe("anime");
  });

  it("should return page 2 results when page param is 2", async () => {
    const req = new Request("http://localhost:3000/api/search?q=naruto&page=2");
    const res = await GET(req);
    const json = await res.json();
    expect(json.page).toBe(2);
    expect(json.totalPages).toBe(5);
  });

  it("should return totalPages from search service", async () => {
    const req = new Request("http://localhost:3000/api/search?q=naruto");
    const res = await GET(req);
    const json = await res.json();
    expect(json.totalPages).toBe(5);
  });
});
