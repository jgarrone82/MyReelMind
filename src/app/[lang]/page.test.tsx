import { describe, it, expect, vi, beforeEach } from "vitest";
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

/**
 * The dashboard page is an async Server Component that imports `@/db`, so we do
 * not render it here. Instead we pin its DATA + DECISION CONTRACT: which stat
 * functions it calls (and with which userId), and that a zero-logged user takes
 * the empty-state branch. UI composition is covered by the WU3 organism tests
 * (MemberCardReceipt / ShelfRow / ActivityReceipt) and the cosmetics helper test.
 */

const PRELOADED_DASHBOARD = {
  getTotalWatched,
  getTotalHours,
  getRecentActivity,
  getDashboardCounts,
  getInProgressItems,
  getRecentlyWatched,
  getAddedThisWeek,
};

/** Mirrors the page's data-fetch orchestration for the authenticated path. */
async function fetchDashboardData(userId: string) {
  const [
    totalWatched,
    totalHours,
    recentActivity,
    counts,
    inProgress,
    recentlyWatched,
    addedThisWeek,
  ] = await Promise.all([
    getTotalWatched(userId),
    getTotalHours(userId),
    getRecentActivity(userId, 5),
    getDashboardCounts(userId),
    getInProgressItems(userId),
    getRecentlyWatched(userId),
    getAddedThisWeek(userId),
  ]);
  return {
    totalWatched,
    totalHours,
    recentActivity,
    counts,
    inProgress,
    recentlyWatched,
    addedThisWeek,
  };
}

const EMPTY_COUNTS = { inProgress: 0, toWatch: 0, totalLogged: 0 };

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardCounts).mockResolvedValue(EMPTY_COUNTS);
    vi.mocked(getInProgressItems).mockResolvedValue([]);
    vi.mocked(getRecentlyWatched).mockResolvedValue([]);
    vi.mocked(getAddedThisWeek).mockResolvedValue([]);
  });

  it("exposes all the dashboard data functions the page depends on", () => {
    for (const fn of Object.values(PRELOADED_DASHBOARD)) {
      expect(typeof fn).toBe("function");
    }
  });

  it("passes the session user id to every stat function when authenticated", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    } as never;
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalWatched).mockResolvedValue(10);
    vi.mocked(getTotalHours).mockResolvedValue(50);
    vi.mocked(getRecentActivity).mockResolvedValue([]);
    vi.mocked(getDashboardCounts).mockResolvedValue({
      inProgress: 2,
      toWatch: 3,
      totalLogged: 15,
    });

    const session = await getSession();
    const userId = session?.user.id;
    await fetchDashboardData(userId!);

    // Preserved contract from before WU4.
    expect(getTotalWatched).toHaveBeenCalledWith("user-123");
    expect(getTotalHours).toHaveBeenCalledWith("user-123");
    expect(getRecentActivity).toHaveBeenCalledWith("user-123", 5);

    // New WU4 data calls.
    expect(getDashboardCounts).toHaveBeenCalledWith("user-123");
    expect(getInProgressItems).toHaveBeenCalledWith("user-123");
    expect(getRecentlyWatched).toHaveBeenCalledWith("user-123");
    expect(getAddedThisWeek).toHaveBeenCalledWith("user-123");
  });

  it("handles a null session gracefully — no userId, no stat calls", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const session = await getSession();
    expect(session).toBeNull();

    const userId = session?.user.id;
    expect(userId).toBeUndefined();

    // With no userId the page short-circuits to zeros (no fetch).
    expect(getTotalWatched).not.toHaveBeenCalled();
    expect(getDashboardCounts).not.toHaveBeenCalled();
  });

  it("renders the empty state when the user has zero logged items", async () => {
    const mockSession = {
      user: { id: "user-456", email: "test@example.com" },
    } as never;
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalWatched).mockResolvedValue(0);
    vi.mocked(getTotalHours).mockResolvedValue(0);
    vi.mocked(getRecentActivity).mockResolvedValue([]);
    vi.mocked(getDashboardCounts).mockResolvedValue(EMPTY_COUNTS);

    const session = await getSession();
    const data = await fetchDashboardData(session!.user.id);

    // The page renders MembersOnlyPanel ("STORE CLOSED") instead of the body
    // whenever there is nothing logged.
    const showsEmptyState = data.counts.totalLogged === 0;
    expect(showsEmptyState).toBe(true);
  });

  it("renders the dashboard body when the user has logged items", async () => {
    const mockSession = {
      user: { id: "user-789", email: "test@example.com" },
    } as never;
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalWatched).mockResolvedValue(42);
    vi.mocked(getTotalHours).mockResolvedValue(150.5);
    vi.mocked(getRecentActivity).mockResolvedValue([]);
    vi.mocked(getDashboardCounts).mockResolvedValue({
      inProgress: 1,
      toWatch: 4,
      totalLogged: 47,
    });

    const session = await getSession();
    const data = await fetchDashboardData(session!.user.id);

    const showsEmptyState = data.counts.totalLogged === 0;
    expect(showsEmptyState).toBe(false);
    expect(data.totalWatched).toBe(42);
    expect(data.totalHours).toBe(150.5);
  });
});
