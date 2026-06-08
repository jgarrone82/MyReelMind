import { describe, it, expect, vi, beforeEach } from "vitest";
import LibraryPage from "./page";

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to: ${url}`);
  }),
}));

const countWhere = vi.fn().mockResolvedValue([{ count: 0 }]);
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: (...args: unknown[]) => countWhere(...args),
        })),
      })),
    })),
    query: {
      userMedia: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

vi.mock("@/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/i18n")>("@/i18n");
  return {
    ...actual,
    getDictionary: vi.fn(async () => ({
      library: {
        title: "Library",
        collection: "items",
        filterAll: "All",
        filterWatching: "Watching",
        filterCompleted: "Completed",
        filterDropped: "Dropped",
        filterPlanned: "Planned",
        empty: "Empty",
        remove: "",
        removeConfirm: "",
        noEpisodes: "",
        statusUpdated: "",
        ratingUpdated: "",
        progressUpdated: "",
        removed: "",
        status: "",
        rating: "",
        yourRating: "",
        notRated: "",
        progress: "",
        previous: "",
        next: "",
        page: "",
        totalItems: "",
        allTypes: "",
        filterMovie: "",
        filterTv: "",
        filterAnime: "",
      },
      common: { loading: "Loading", cancel: "Cancel", error: "Error" },
      media: { status: {}, episode: "", chapter: "", of: "" },
      dashboard: { ctaSearch: "Search" },
    })),
  };
});

import { getAuthenticatedUser } from "@/lib/auth/server";
import { db } from "@/db";

const props = {
  params: Promise.resolve({ lang: "en" }),
  searchParams: Promise.resolve({}),
};

describe("LibraryPage auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countWhere.mockResolvedValue([{ count: 0 }]);
    vi.mocked(db.query.userMedia.findMany).mockResolvedValue([] as never);
  });

  it("redirects to login when there is no authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    await expect(
      LibraryPage({
        params: Promise.resolve({ lang: "en" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("Redirect to: /en/login");
  });

  it("scopes the library query on the revalidated user id", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "user-123",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);

    await LibraryPage(props);

    expect(getAuthenticatedUser).toHaveBeenCalled();
    // Assert the query is actually filtered (a `where` clause is passed), not
    // just that findMany ran — otherwise a dropped user scope would slip through.
    expect(db.query.userMedia.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.anything() })
    );
  });
});
