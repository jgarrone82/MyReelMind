import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      userMedia: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/media/detail", () => ({
  fetchMediaDetail: vi.fn(),
}));

import { getAuthenticatedUser } from "@/lib/auth/server";
import { db } from "@/db";

const mockUserId = "user-uuid-123";

function mockAuthenticated() {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({
    id: mockUserId,
  } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);
}

function mockUnauthenticated() {
  vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
}

function mockUserMediaFindMany(results: unknown[]) {
  vi.mocked(db.query.userMedia.findMany).mockResolvedValue(results as never);
}

describe("GET /api/library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    mockUnauthenticated();
    const req = new Request("http://localhost:3000/api/library");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("should return empty array when user has no items", async () => {
    mockAuthenticated();
    mockUserMediaFindMany([]);
    const req = new Request("http://localhost:3000/api/library");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual([]);
    expect(json.total).toBe(0);
    expect(json.page).toBe(1);
  });

  it("should return paginated results with default params", async () => {
    mockAuthenticated();
    mockUserMediaFindMany([
      {
        id: "um-1",
        mediaItemId: "mi-1",
        status: "watching",
        progress: 5,
        rating: null,
        updatedAt: new Date(),
        mediaItem: {
          id: "mi-1",
          source: "tmdb",
          sourceId: "123",
          title: "Test Movie",
          posterPath: "/poster.jpg",
          type: "movie",
          runtime: 120,
        },
      },
    ]);
    const req = new Request("http://localhost:3000/api/library");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.total).toBe(1);
    expect(json.page).toBe(1);
    expect(json.limit).toBe(20);
    expect(json.data[0].publicId).toBe("tmdb-123");
  });

  it("should return 400 for invalid status filter", async () => {
    mockAuthenticated();
    const req = new Request("http://localhost:3000/api/library?status=invalid");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("should support status filter", async () => {
    mockAuthenticated();
    mockUserMediaFindMany([]);
    const req = new Request("http://localhost:3000/api/library?status=watching");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(db.query.userMedia.findMany).toHaveBeenCalled();
  });

  it("should support pagination params", async () => {
    mockAuthenticated();
    mockUserMediaFindMany([]);
    const req = new Request("http://localhost:3000/api/library?page=2&limit=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.page).toBe(2);
    expect(json.limit).toBe(10);
  });
});