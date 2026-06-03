import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { getTrending } from "@/lib/search/service";

vi.mock("@/lib/search/service", () => ({
  getTrending: vi.fn(),
}));

const mockItem = {
  id: "tmdb-1",
  source: "tmdb",
  type: "movie",
  title: "Trending Movie",
  originalTitle: null,
  year: 2024,
  description: "A trending movie",
  score: 80,
  popularity: 100,
  coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
  bannerImage: null,
  genres: ["Action"],
};

describe("GET /api/trending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the trending results with a 200 status", async () => {
    vi.mocked(getTrending).mockResolvedValue({ results: [mockItem] } as never);

    const res = await GET(new Request("http://localhost:3000/api/trending"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(1);
    expect(json.results[0].title).toBe("Trending Movie");
  });

  it("returns an empty array with a 200 status when there is no trending data", async () => {
    vi.mocked(getTrending).mockResolvedValue({ results: [] } as never);

    const res = await GET(new Request("http://localhost:3000/api/trending"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toEqual([]);
  });

  it("degrades to an empty 200 (honest degradation) when the service throws", async () => {
    vi.mocked(getTrending).mockRejectedValue(new Error("boom"));

    const res = await GET(new Request("http://localhost:3000/api/trending"));

    // Honest degradation: the empty list is a real 200 the hook consumes, so
    // the UI falls back to its prompt with no error/retry. A 500 would never be
    // read (the hook throws on !res.ok) and would trigger React Query retries.
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toEqual([]);
  });
});
