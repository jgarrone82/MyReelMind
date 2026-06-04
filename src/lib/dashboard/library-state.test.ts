import { describe, it, expect, vi, beforeEach } from "vitest";
import { mapStatusToBadge, getLibraryStateForMediaIds } from "./library-state";
import { db } from "@/db";

// Mirror the chained-query mock pattern from stats.test.ts: db.select() returns
// a fluent builder, and the terminal .where() yields a thenable resolving to rows.
const { mockSelectFn } = vi.hoisted(() => ({ mockSelectFn: vi.fn() }));

vi.mock("@/db", () => ({
  db: {
    select: mockSelectFn,
  },
}));

function thenable<T>(value: T) {
  return {
    then: vi.fn((resolve: (val: T) => void) => resolve(value)),
  };
}

// Build a fully-chained select() -> from() -> innerJoin() -> where() mock that
// resolves to the given rows.
function mockSelectResolving(rows: unknown[]) {
  mockSelectFn.mockReturnValue({
    from: vi.fn().mockReturnValue({
      innerJoin: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue(thenable(rows)),
      }),
    }),
  });
}

describe("mapStatusToBadge", () => {
  it("maps no row (null) to ADD", () => {
    expect(mapStatusToBadge(null)).toBe("add");
  });

  it("maps watching to IN PROGRESS", () => {
    expect(mapStatusToBadge("watching")).toBe("in_progress");
  });

  it("maps paused to IN PROGRESS", () => {
    expect(mapStatusToBadge("paused")).toBe("in_progress");
  });

  it("maps want_to_watch to IN LIBRARY", () => {
    expect(mapStatusToBadge("want_to_watch")).toBe("in_library");
  });

  it("maps completed to IN LIBRARY", () => {
    expect(mapStatusToBadge("completed")).toBe("in_library");
  });

  it("maps dropped to IN LIBRARY (locked — dropped is a real tracked row)", () => {
    expect(mapStatusToBadge("dropped")).toBe("in_library");
  });
});

describe("getLibraryStateForMediaIds", () => {
  const userId = "user-uuid-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns {} without hitting the DB when publicIds is empty", async () => {
    const result = await getLibraryStateForMediaIds(userId, []);
    expect(result).toEqual({});
    expect(mockSelectFn).not.toHaveBeenCalled();
  });

  it("returns {} without hitting the DB when all ids are malformed", async () => {
    const result = await getLibraryStateForMediaIds(userId, ["garbage", "nope-1", "imdb-9"]);
    expect(result).toEqual({});
    expect(mockSelectFn).not.toHaveBeenCalled();
  });

  it("skips one malformed id among valid ones and resolves the rest", async () => {
    mockSelectResolving([
      { source: "tmdb", sourceId: "1", status: "completed" },
    ]);

    const result = await getLibraryStateForMediaIds(userId, ["tmdb-1", "garbage"]);

    // valid id was queried and resolved; malformed id contributes nothing and
    // never crashes the call.
    expect(mockSelectFn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ "tmdb-1": "in_library" });
    expect(result["garbage"]).toBeUndefined();
  });

  it("resolves mixed TMDB + AniList rows to their correct badge states", async () => {
    mockSelectResolving([
      { source: "tmdb", sourceId: "1", status: "watching" },
      { source: "anilist", sourceId: "42", status: "completed" },
    ]);

    const result = await getLibraryStateForMediaIds(userId, [
      "tmdb-1",
      "anilist-42",
      "tmdb-2",
    ]);

    expect(result).toEqual({
      "tmdb-1": "in_progress",
      "anilist-42": "in_library",
    });
    // tmdb-2 has no row -> not a key (client defaults absent to ADD)
    expect(result["tmdb-2"]).toBeUndefined();
  });

  it("returns no keys for an all-ADD page (user tracks none of the results)", async () => {
    mockSelectResolving([]);

    const result = await getLibraryStateForMediaIds(userId, ["tmdb-1", "anilist-2"]);

    expect(result).toEqual({});
  });

  it("only keys rows the query returned (query is filtered by userId)", async () => {
    // The query filters by userId, so another user's rows never come back.
    // Simulate: the requested ids include one the current user owns and one
    // owned by someone else (absent from the rows the query returns).
    mockSelectResolving([
      { source: "tmdb", sourceId: "1", status: "paused" },
    ]);

    const result = await getLibraryStateForMediaIds(userId, ["tmdb-1", "tmdb-99"]);

    expect(result).toEqual({ "tmdb-1": "in_progress" });
    expect(result["tmdb-99"]).toBeUndefined();
  });
});
