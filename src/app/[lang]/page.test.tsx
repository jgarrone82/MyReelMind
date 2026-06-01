import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Suspense, isValidElement } from "react";
import { getSession } from "@/lib/auth/server";
import {
  getTotalWatched,
  getTotalHours,
  getRecentActivity,
  getDashboardCounts,
  getInProgressItems,
  getRecentlyWatched,
  getAddedThisWeek,
} from "@/lib/dashboard/stats";
import DashboardPage from "./page";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

/**
 * The dashboard page is an async Server Component that wraps the async
 * <DashboardContent> in a <Suspense> boundary. The jsdom/react-dom test
 * renderer cannot resolve a nested async component (it just shows the Suspense
 * fallback), so we split the contract:
 *
 *  1. DashboardContent — the data-fetch + branch logic — is invoked directly
 *     and rendered (`render(await DashboardContent(...))`), mirroring the
 *     project's RSC test pattern (verify-email/page.test.tsx).
 *  2. DashboardPage — the thin wrapper — is invoked and its returned element
 *     is asserted structurally: it must wrap DashboardContent in a Suspense
 *     boundary whose fallback is the DashboardSkeleton (D1: skeleton streams
 *     during fetch, scoped to the dashboard, not a [lang]/loading.tsx).
 *
 * Seams mocked: @/lib/auth/server (session), @/lib/dashboard/stats (data),
 * @/db (users.findFirst), getDictionary (deterministic copy).
 */

vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/dashboard/stats", () => ({
  getTotalWatched: vi.fn(),
  getTotalHours: vi.fn(),
  getRecentActivity: vi.fn(),
  getDashboardCounts: vi.fn(),
  getInProgressItems: vi.fn(),
  getRecentlyWatched: vi.fn(),
  getAddedThisWeek: vi.fn(),
}));

const usersFindFirst = vi.fn();
vi.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: (...args: unknown[]) => usersFindFirst(...args),
      },
    },
  },
}));

vi.mock("@/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/i18n")>("@/i18n");
  return {
    ...actual,
    getDictionary: vi.fn(async () => DICT),
  };
});

/** Minimal dictionary slice the dashboard tree reads. */
const DICT = {
  dashboard: {
    kicker: "MEMBER DASHBOARD",
    title: "Your Dashboard",
    greeting: "Welcome back",
    totalWatched: "Total watched",
    totalHours: "Total hours",
    inProgress: "In progress",
    toWatch: "To watch",
    resumeRow: "Pick up where you left off",
    recentlyWatched: "Recently watched",
    addedThisWeek: "Added this week",
    activityLog: "Activity log",
    seeAll: "See all",
    memberCard: {
      title: "Member card",
      member: "Member",
      memberSince: "Member since",
      cardNo: "Card no.",
    },
    receipt: {
      tally: "Tally",
      subtotal: "Subtotal",
      thankYou: "Thank you",
      drillHint: "Tap a stat to drill in",
    },
    empty: {
      kicker: "EMPTY",
      headline: "Nothing logged yet",
      body: "Start your collection.",
      note: "The store is closed.",
      cta: "Browse the catalog",
      ctaSecondary: "Open your library",
    },
  },
  media: {
    status: {
      want_to_watch: "WANT TO WATCH",
      watching: "WATCHING",
      completed: "COMPLETED",
      paused: "PAUSED",
      dropped: "DROPPED",
    },
    stickers: { new: "NEW" },
  },
} as never;

const EMPTY_COUNTS = { inProgress: 0, toWatch: 0, totalLogged: 0 };

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "um-1",
    userId: "user-1",
    mediaItemId: "mi-1",
    status: "watching",
    updatedAt: new Date("2026-05-31T00:00:00Z"),
    createdAt: new Date("2026-05-30T00:00:00Z"),
    mediaItem: {
      id: "mi-1",
      source: "tmdb",
      sourceId: "603",
      type: "movie",
      title: "The Matrix",
      releaseDate: "1999",
      posterPath: null,
      genres: ["Action"],
      runtime: 136,
    },
    ...overrides,
  } as never;
}

describe("DashboardPage (wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps DashboardContent in a Suspense boundary with the DashboardSkeleton fallback", async () => {
    const ui = await DashboardPage({ params: Promise.resolve({ lang: "en" }) });

    // Top-level element is a Suspense boundary.
    expect(isValidElement(ui)).toBe(true);
    expect(ui.type).toBe(Suspense);

    // Fallback is the dashboard skeleton (scoped here, NOT a [lang]/loading.tsx).
    const fallback = (ui.props as { fallback: unknown }).fallback;
    expect(isValidElement(fallback)).toBe(true);
    expect((fallback as { type: unknown }).type).toBe(DashboardSkeleton);

    // Child is DashboardContent, receiving lang + the resolved dictionary.
    const child = (ui.props as { children: unknown }).children;
    expect(isValidElement(child)).toBe(true);
    expect((child as { type: unknown }).type).toBe(DashboardContent);
    expect((child as { props: { lang: string } }).props.lang).toBe("en");
  });
});

describe("DashboardContent (data + branch logic)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTotalWatched).mockResolvedValue(0);
    vi.mocked(getTotalHours).mockResolvedValue(0);
    vi.mocked(getRecentActivity).mockResolvedValue([]);
    vi.mocked(getDashboardCounts).mockResolvedValue(EMPTY_COUNTS);
    vi.mocked(getInProgressItems).mockResolvedValue([]);
    vi.mocked(getRecentlyWatched).mockResolvedValue([]);
    vi.mocked(getAddedThisWeek).mockResolvedValue([]);
    usersFindFirst.mockResolvedValue(undefined);
  });

  it("renders the empty (STORE CLOSED) state on a null session", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    render(await DashboardContent({ lang: "en", dict: DICT }));

    expect(screen.getByText("STORE")).toBeInTheDocument();
    expect(screen.getByText("CLOSED")).toBeInTheDocument();
    expect(screen.getByText("Nothing logged yet")).toBeInTheDocument();
    // No stat calls happen without a userId (preserved contract).
    expect(getTotalWatched).not.toHaveBeenCalled();
    expect(getDashboardCounts).not.toHaveBeenCalled();
    expect(usersFindFirst).not.toHaveBeenCalled();
  });

  it("renders the empty state when an authenticated user has zero logged items", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "user-123", email: "test@example.com" },
    } as never);
    vi.mocked(getDashboardCounts).mockResolvedValue(EMPTY_COUNTS);

    render(await DashboardContent({ lang: "en", dict: DICT }));

    expect(screen.getByText("CLOSED")).toBeInTheDocument();
    // Preserved contract: stat fns called with the session userId.
    expect(getTotalWatched).toHaveBeenCalledWith("user-123");
    expect(getTotalHours).toHaveBeenCalledWith("user-123");
    expect(getRecentActivity).toHaveBeenCalledWith("user-123", 5);
    // The users fetch uses the session userId.
    expect(usersFindFirst).toHaveBeenCalledTimes(1);
  });

  it("renders the member card and shelves when the user has logged items", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "user-789", email: "member@example.com" },
    } as never);
    vi.mocked(getTotalWatched).mockResolvedValue(42);
    vi.mocked(getTotalHours).mockResolvedValue(150.5);
    vi.mocked(getDashboardCounts).mockResolvedValue({
      inProgress: 1,
      toWatch: 4,
      totalLogged: 47,
    });
    vi.mocked(getInProgressItems).mockResolvedValue([makeRow()]);
    vi.mocked(getRecentActivity).mockResolvedValue([makeRow()]);
    usersFindFirst.mockResolvedValue({
      id: "user-789",
      displayName: "Neo",
      createdAt: new Date("2024-01-01T00:00:00Z"),
    });

    render(await DashboardContent({ lang: "en", dict: DICT }));

    // Member card identity rendered from the users row.
    expect(screen.getByText("Neo")).toBeInTheDocument();
    // The in-progress shelf renders its kicker as the section's accessible name.
    expect(
      screen.getByRole("region", { name: "Pick up where you left off" })
    ).toBeInTheDocument();
    // The empty-state stamp must NOT be present on the populated path.
    expect(screen.queryByText("CLOSED")).not.toBeInTheDocument();

    // Preserved contract assertions.
    expect(getTotalWatched).toHaveBeenCalledWith("user-789");
    expect(getTotalHours).toHaveBeenCalledWith("user-789");
    expect(getRecentActivity).toHaveBeenCalledWith("user-789", 5);
    expect(getDashboardCounts).toHaveBeenCalledWith("user-789");
    expect(getInProgressItems).toHaveBeenCalledWith("user-789");
    expect(getRecentlyWatched).toHaveBeenCalledWith("user-789");
    expect(getAddedThisWeek).toHaveBeenCalledWith("user-789");
    expect(usersFindFirst).toHaveBeenCalledTimes(1);
  });
});
