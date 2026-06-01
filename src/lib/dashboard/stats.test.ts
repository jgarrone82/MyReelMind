import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTotalWatched,
  getTotalHours,
  getStatsByType,
  getStatsByGenre,
  getStatsByStatus,
  getRecentActivity,
  getDashboardCounts,
  getInProgressItems,
  getRecentlyWatched,
  getAddedThisWeek,
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
    expect(result[0].mediaItem?.title).toBe("Inception");
    expect(result[1].mediaItem?.title).toBe("Attack on Titan");
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

describe("getDashboardCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return all-zero counts when user has no media", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(
          thenable([{ inProgress: 0, toWatch: 0, totalLogged: 0 }])
        ),
      }),
    });

    const result = await getDashboardCounts("user-123");
    expect(result).toEqual({ inProgress: 0, toWatch: 0, totalLogged: 0 });
  });

  it("should return zeros when query yields no rows at all", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(thenable([])),
      }),
    });

    const result = await getDashboardCounts("user-123");
    expect(result).toEqual({ inProgress: 0, toWatch: 0, totalLogged: 0 });
  });

  it("should map watching+paused to inProgress, want_to_watch to toWatch, and all rows to totalLogged", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(
          thenable([{ inProgress: 4, toWatch: 7, totalLogged: 20 }])
        ),
      }),
    });

    const result = await getDashboardCounts("user-123");
    expect(result.inProgress).toBe(4);
    expect(result.toWatch).toBe(7);
    expect(result.totalLogged).toBe(20);
  });

  it("should coerce null/undefined aggregate fields to 0", async () => {
    mockSelectFn.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(
          thenable([{ inProgress: null, toWatch: null, totalLogged: null }])
        ),
      }),
    });

    const result = await getDashboardCounts("user-123");
    expect(result).toEqual({ inProgress: 0, toWatch: 0, totalLogged: 0 });
  });
});

describe("getInProgressItems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no in-progress items", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getInProgressItems("user-123");
    expect(result).toEqual([]);
  });

  it("should return joined items ordered by updatedAt", async () => {
    const now = new Date();
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      {
        id: "um-1",
        status: "watching",
        updatedAt: new Date(now.getTime() - 1000),
        mediaItem: { id: "media-1", title: "Severance", type: "tv" as const, posterPath: null },
      },
      {
        id: "um-2",
        status: "paused",
        updatedAt: new Date(now.getTime() - 2000),
        mediaItem: { id: "media-2", title: "Dune", type: "movie" as const, posterPath: null },
      },
    ] as any);

    const result = await getInProgressItems("user-123");
    expect(result).toHaveLength(2);
    expect(result[0].mediaItem?.title).toBe("Severance");
    expect(result[1].mediaItem?.title).toBe("Dune");
  });

  it("should default the limit to 12", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getInProgressItems("user-123");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 12 })
    );
  });

  it("should respect a custom limit and request the mediaItem relation", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getInProgressItems("user-123", 5);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 5,
        with: { mediaItem: true },
      })
    );
  });
});

describe("getRecentlyWatched", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when nothing completed", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getRecentlyWatched("user-123");
    expect(result).toEqual([]);
  });

  it("should return joined completed items ordered by updatedAt", async () => {
    const now = new Date();
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      {
        id: "um-1",
        status: "completed",
        updatedAt: new Date(now.getTime() - 1000),
        mediaItem: { id: "media-1", title: "Inception", type: "movie" as const, posterPath: null },
      },
    ] as any);

    const result = await getRecentlyWatched("user-123");
    expect(result).toHaveLength(1);
    expect(result[0].mediaItem?.title).toBe("Inception");
  });

  it("should default the limit to 12 and request the mediaItem relation", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getRecentlyWatched("user-123");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 12,
        with: { mediaItem: true },
      })
    );
  });

  it("should respect a custom limit", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getRecentlyWatched("user-123", 4);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 4 })
    );
  });
});

describe("getAddedThisWeek", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Fixed "now" so the 7-day boundary is deterministic.
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return empty array when nothing was added recently", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    const result = await getAddedThisWeek("user-123");
    expect(result).toEqual([]);
  });

  it("should default the limit to 12 and request the mediaItem relation", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getAddedThisWeek("user-123");

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 12,
        with: { mediaItem: true },
      })
    );
  });

  it("should respect a custom limit", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([]);

    await getAddedThisWeek("user-123", 6);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 6 })
    );
  });

  it("should build a where clause that filters on a cutoff 7 days before now", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    let capturedWhere: any;
    mockFindMany.mockImplementation(((args: any) => {
      capturedWhere = args.where;
      return Promise.resolve([]);
    }) as any);

    await getAddedThisWeek("user-123");

    // The function must compute a cutoff date and bind it into the query.
    // We assert the cutoff is exactly 7 days before the frozen system time by
    // collecting every Date the function bound anywhere into the SQL tree.
    const expectedCutoff = new Date(
      new Date("2026-06-01T12:00:00.000Z").getTime() - 7 * 24 * 60 * 60 * 1000
    );
    expect(capturedWhere).toBeDefined();

    const foundDates: Date[] = [];
    const seen = new Set<unknown>();
    const collect = (node: unknown): void => {
      if (node == null || typeof node !== "object") return;
      if (node instanceof Date) {
        foundDates.push(node);
        return;
      }
      if (seen.has(node)) return;
      seen.add(node);
      for (const value of Object.values(node as Record<string, unknown>)) {
        collect(value);
      }
    };
    collect(capturedWhere);

    expect(
      foundDates.some((d) => d.getTime() === expectedCutoff.getTime())
    ).toBe(true);
  });

  it("should return joined items added within the window", async () => {
    const mockFindMany = vi.mocked(db.query.userMedia.findMany);
    mockFindMany.mockResolvedValue([
      {
        id: "um-1",
        status: "want_to_watch",
        createdAt: new Date("2026-05-30T12:00:00.000Z"),
        mediaItem: { id: "media-1", title: "Sinners", type: "movie" as const, posterPath: null },
      },
    ] as any);

    const result = await getAddedThisWeek("user-123");
    expect(result).toHaveLength(1);
    expect(result[0].mediaItem?.title).toBe("Sinners");
  });
});