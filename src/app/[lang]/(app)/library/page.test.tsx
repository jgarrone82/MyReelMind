import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
        kicker: "Member Collection",
        subtitle: "Your rented & queued tapes",
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

describe("LibraryPage VHS chrome (issue #51)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    countWhere.mockResolvedValue([{ count: 0 }]);
    vi.mocked(db.query.userMedia.findMany).mockResolvedValue([] as never);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "user-123",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);
  });

  it("renders a tape-skeleton grid as the Suspense fallback, hidden from AT", async () => {
    const tree = (await LibraryPage(props)) as React.ReactElement<{
      fallback: React.ReactElement;
    }>;
    const { container } = render(tree.props.fallback);

    const skeletons = container.querySelectorAll(".tape-skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(
      skeletons[0].closest("[aria-hidden]"),
      "decorative skeleton grid must be aria-hidden"
    ).toBeTruthy();
  });

  it("renders the empty state as a framed VHS panel with the search CTA intact", async () => {
    const tree = await LibraryPage(props);
    render(tree as React.ReactElement);

    const emptyText = screen.getByText("Empty");
    expect(
      emptyText.closest('[class*="border-2"]'),
      "empty state must sit inside a framed panel, not a bare block"
    ).toBeTruthy();

    const cta = screen.getByText(/Search/).closest("a");
    expect(cta?.getAttribute("href")).toBe("/en/search");
  });

  it("renders the decorative kicker and subtitle from i18n keys", async () => {
    const tree = await LibraryPage(props);
    render(tree as React.ReactElement);

    expect(screen.getByText("Member Collection")).toBeInTheDocument();
    expect(screen.getByText(/Your rented & queued tapes/)).toBeInTheDocument();
  });

  it("preserves every status filter href and marks the active tab", async () => {
    const tree = await LibraryPage({
      params: Promise.resolve({ lang: "en" }),
      searchParams: Promise.resolve({ status: "watching" }),
    });
    render(tree as React.ReactElement);

    expect(screen.getByText("All").closest("a")?.getAttribute("href")).toBe(
      "/en/library"
    );
    for (const [label, key] of [
      ["Watching", "watching"],
      ["Completed", "completed"],
      ["Dropped", "dropped"],
      ["Planned", "want_to_watch"],
    ] as const) {
      expect(screen.getByText(label).closest("a")?.getAttribute("href")).toBe(
        `/en/library?status=${key}`
      );
    }

    const active = screen.getByText("Watching").closest("a");
    expect(active?.getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("All").closest("a")?.getAttribute("aria-current")).toBeNull();
  });

  it("retains no shadcn grey/semantic-token chrome on the page shell", async () => {
    const tree = await LibraryPage(props);
    const { container } = render(tree as React.ReactElement);

    for (const cls of ["bg-accent", "bg-muted", "text-muted-foreground"]) {
      expect(
        container.querySelector(`[class*="${cls}"]`),
        `residual shadcn class ${cls} found on library page shell`
      ).toBeNull();
    }
  });
});
