/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTotalWatched,
  getTotalHours,
  getStatsByType,
  getStatsByGenre,
  getStatsByStatus,
  getRecentActivity,
} from "./stats";
import { db } from "@/db";

// Use vi.hoisted to create mock before vi.mock is hoisted
const { mockSelectFn } = vi.hoisted(() => {
  return {
    mockSelectFn: vi.fn(),
  };
});

vi.mock("@/db", () => {
  return {
    db: {
      select: mockSelectFn,
      query: {
        userMedia: {
          findMany: vi.fn(),
        },
      },
    },
  };
});

// Build a thenable mock that resolves to the given value
function thenable<T>(value: T) {
  return {
    then: vi.fn((resolve: (val: T) => void) => resolve(value)),
  };
}

describe("getTotalWatched", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when user has no media", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(thenable([])),
        }),
      }),
    });

    const result = await getTotalWatched("user-123");
    expect(result).toBe(0);
  });

  it("should return count of completed media items", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(thenable([{ count: 5 }])),
        }),
      }),
    });

    const result = await getTotalWatched("user-123");
    expect(result).toBe(5);
  });
});

describe("getTotalHours", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 0 when user has no media", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(thenable([{ sum: null }])),
        }),
      }),
    });

    const result = await getTotalHours("user-123");
    expect(result).toBe(0);
  });

  it("should return sum of runtime from completed media items divided by 60", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(thenable([{ sum: 210 }])),
        }),
      }),
    });

    const result = await getTotalHours("user-123");
    expect(result).toBeCloseTo(3.5, 1);
  });

  it("should handle null sum (treat as 0)", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(thenable([{ sum: null }])),
        }),
      }),
    });

    const result = await getTotalHours("user-123");
    expect(result).toBe(0);
  });
});

describe("getStatsByType", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return grouped stats by media type", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue(thenable([
                { type: "movie", count: 3 },
                { type: "anime", count: 2 },
              ])),
            }),
          }),
        }),
      }),
    });

    const result = await getStatsByType("user-123");
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("movie");
    expect(result[0].count).toBe(3);
  });

  it("should filter out zero count types", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue(thenable([
                { type: "movie", count: 3 },
                { type: "tv", count: 0 },
              ])),
            }),
          }),
        }),
      }),
    });

    const result = await getStatsByType("user-123");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("movie");
  });
});

describe("getStatsByGenre", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return top 5 genres", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue(thenable([
                  { genre: "Action", count: 4 },
                  { genre: "Drama", count: 3 },
                ])),
              }),
            }),
          }),
        }),
      }),
    });

    const result = await getStatsByGenre("user-123");
    expect(result).toHaveLength(2);
    expect(result[0].genre).toBe("Action");
    expect(result[0].count).toBe(4);
  });
});

describe("getStatsByStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return grouped stats by status", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue(thenable([
              { status: "watching", count: 3 },
              { status: "completed", count: 5 },
            ])),
          }),
        }),
      }),
    });

    const result = await getStatsByStatus("user-123");
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("watching");
    expect(result[0].count).toBe(3);
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

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 3,
      })
    );
  });
});