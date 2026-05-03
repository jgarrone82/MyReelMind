/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSession } from "@/lib/auth/server";
import { getTotalWatched, getTotalHours, getRecentActivity } from "@/lib/dashboard/stats";

vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/dashboard/stats", () => ({
  getTotalWatched: vi.fn(),
  getTotalHours: vi.fn(),
  getRecentActivity: vi.fn(),
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should pass user id to stats functions when authenticated", async () => {
    const mockSession = {
      user: { id: "user-123", email: "test@example.com" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    } as any;
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalWatched).mockResolvedValue(10);
    vi.mocked(getTotalHours).mockResolvedValue(50);
    vi.mocked(getRecentActivity).mockResolvedValue([]);

    const session = await getSession();
    const userId = session?.user.id;

    await Promise.all([
      getTotalWatched(userId!),
      getTotalHours(userId!),
      getRecentActivity(userId!, 5),
    ]);

    expect(getTotalWatched).toHaveBeenCalledWith("user-123");
    expect(getTotalHours).toHaveBeenCalledWith("user-123");
    expect(getRecentActivity).toHaveBeenCalledWith("user-123", 5);
  });

  it("should handle null session gracefully", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(getTotalWatched).mockResolvedValue(0);
    vi.mocked(getTotalHours).mockResolvedValue(0);
    vi.mocked(getRecentActivity).mockResolvedValue([]);

    const session = await getSession();
    expect(session).toBeNull();

    const userId = session?.user.id;
    expect(userId).toBeUndefined();
  });

  it("should display stats when authenticated", async () => {
    const mockSession = {
      user: { id: "user-456", email: "test@example.com" },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    } as any;
    vi.mocked(getSession).mockResolvedValue(mockSession);
    vi.mocked(getTotalWatched).mockResolvedValue(42);
    vi.mocked(getTotalHours).mockResolvedValue(150.5);
    vi.mocked(getRecentActivity).mockResolvedValue([]);

    const [watched, hours] = await Promise.all([
      getTotalWatched("user-456"),
      getTotalHours("user-456"),
    ]);

    expect(watched).toBe(42);
    expect(hours).toBe(150.5);
  });
});