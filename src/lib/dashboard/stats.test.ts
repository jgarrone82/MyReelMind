/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTotalWatched, getTotalHours, getRecentActivity } from "./stats";
import { db } from "@/db";

vi.mock("@/db", () => ({
  db: {
    query: {
      userMedia: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe("getTotalWatched", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when user has no media", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getTotalWatched("user-123");

    expect(result).toBe(0);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: expect.anything(),
      with: expect.anything(),
    });
  });

  it("should return count of completed media items", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      { id: "um-1", status: "completed" },
      { id: "um-2", status: "completed" },
      { id: "um-3", status: "watching" },
    ] as any);

    const result = await getTotalWatched("user-123");

    expect(result).toBe(2);
  });
});

describe("getTotalHours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when user has no media", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getTotalHours("user-123");

    expect(result).toBe(0);
  });

  it("should sum runtime from completed media items", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      { id: "um-1", status: "completed", mediaItem: { runtime: 120 } },
      { id: "um-2", status: "completed", mediaItem: { runtime: 90 } },
      { id: "um-3", status: "watching", mediaItem: { runtime: 60 } },
    ] as any);

    const result = await getTotalHours("user-123");

    // Only completed (120 + 90) = 210 minutes = 3.5 hours
    expect(result).toBeCloseTo(3.5, 1);
  });

  it("should handle null runtime (treat as 0)", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      { id: "um-1", status: "completed", mediaItem: { runtime: null } },
      { id: "um-2", status: "completed", mediaItem: { runtime: 60 } },
    ] as any);

    const result = await getTotalHours("user-123");

    expect(result).toBeCloseTo(1.0, 1);
  });
});

describe("getRecentActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no activity", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getRecentActivity("user-123");

    expect(result).toEqual([]);
  });

  it("should return limited recent activity sorted by updatedAt", async () => {
    const now = new Date();
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      {
        id: "um-1",
        status: "completed",
        updatedAt: new Date(now.getTime() - 1000),
        mediaItem: { id: "media-1", title: "Inception", type: "movie" as const, posterPath: null },
      },
      {
        id: "um-2",
        status: "watching",
        updatedAt: new Date(now.getTime() - 2000),
        mediaItem: { id: "media-2", title: "Attack on Titan", type: "anime" as const, posterPath: null },
      },
    ] as any);

    const result = await getRecentActivity("user-123", 5);

    expect(result).toHaveLength(2);
    expect(result[0].mediaItem.title).toBe("Inception");
    expect(result[1].mediaItem.title).toBe("Attack on Titan");
  });

  it("should respect limit parameter", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getRecentActivity("user-123", 3);

    // Check that the query uses the limit
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 3,
      })
    );
  });
});