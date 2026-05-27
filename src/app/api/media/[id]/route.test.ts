import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/media/detail", () => ({
  fetchMediaDetail: vi.fn(),
}));

import { fetchMediaDetail } from "@/lib/media/detail";

describe("GET /api/media/[id]", () => {
  it("should return media details for valid id", async () => {
    const mockMedia = {
      id: "tmdb-123",
      source: "tmdb" as const,
      type: "movie" as const,
      title: "Inception",
      originalTitle: null,
      year: 2010,
      description: "A mind-bending thriller",
      score: 88,
      popularity: 100,
      coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
      bannerImage: null,
      genres: ["Sci-Fi", "Action"],
    };

    vi.mocked(fetchMediaDetail).mockResolvedValue(mockMedia);

    const req = new Request("http://localhost:3000/api/media/tmdb-123");
    const res = await GET(req, { params: Promise.resolve({ id: "tmdb-123" }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Inception");
  });

  it("should return 404 when media not found", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/media/tmdb-999");
    const res = await GET(req, { params: Promise.resolve({ id: "tmdb-999" }) });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Media not found");
  });

  it("should return 400 for invalid id format", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/media/invalid");
    const res = await GET(req, { params: Promise.resolve({ id: "invalid" }) });

    expect(res.status).toBe(404);
  });
});
