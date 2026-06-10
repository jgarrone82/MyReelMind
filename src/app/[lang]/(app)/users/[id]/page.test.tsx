import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicProfilePage from "./page";

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const usersFindFirst = vi.fn();
const userMediaFindMany = vi.fn();
vi.mock("@/db", () => ({
  db: {
    query: {
      users: {
        findFirst: (...args: unknown[]) => usersFindFirst(...args),
      },
      userMedia: {
        findMany: (...args: unknown[]) => userMediaFindMany(...args),
      },
    },
  },
}));

vi.mock("@/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/i18n")>("@/i18n");
  return {
    ...actual,
    getDictionary: vi.fn(async () => ({
      profile: {
        title: "Profile",
        privateTitle: "Private",
        privateMessage: "This profile is private",
        items: "Items",
        completed: "Completed",
        watching: "Watching",
        editSettings: "Edit settings",
        recentActivity: "Recent activity",
        emptyLibrary: "Empty",
        kicker: "Member Card",
        subtitle: "Browsing history",
      },
      media: { status: { watching: "Watching", completed: "Completed" } },
    })),
  };
});

vi.mock("@/components/profile/PublicProfileCard", () => ({
  PublicProfileCard: () => <div data-testid="profile-card" />,
}));

import { getAuthenticatedUser } from "@/lib/auth/server";

const publicProfileRow = {
  id: "profile-owner",
  displayName: "Ana",
  avatarUrl: null,
  isPublic: true,
};

describe("PublicProfilePage owner check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersFindFirst.mockResolvedValue(publicProfileRow);
    userMediaFindMany.mockResolvedValue([]);
  });

  it("shows the owner-only edit link when the revalidated viewer owns the profile", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "profile-owner",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);

    render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "profile-owner" }),
      })
    );

    expect(screen.getByText("Edit settings")).toBeInTheDocument();
  });

  it("hides the owner-only edit link when the revalidated viewer is someone else", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "other-user",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);

    render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "profile-owner" }),
      })
    );

    expect(screen.queryByText("Edit settings")).not.toBeInTheDocument();
  });

  it("hides the owner-only edit link for an anonymous viewer", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "profile-owner" }),
      })
    );

    expect(screen.queryByText("Edit settings")).not.toBeInTheDocument();
  });

  it("renders the owner edit link with VHS phosphor styling, not text-blue-600 (R5/S13)", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "profile-owner",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);

    render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "profile-owner" }),
      })
    );

    const link = screen.getByText("Edit settings");
    expect(link.className).not.toContain("text-blue-600");
    expect(link.className).toContain("var(--vhs-phosphor)");
  });
});

describe("PublicProfilePage VHS chrome (R29/R30/R5/S13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
  });

  it("renders the private-profile state as a VHS panel, not a grey block (R30/R5)", async () => {
    usersFindFirst.mockResolvedValue({
      id: "private-user",
      displayName: "Hidden",
      avatarUrl: null,
      isPublic: false,
    });

    const { container } = render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "private-user" }),
      })
    );

    expect(screen.getByText("Private")).toBeInTheDocument();
    const main = container.querySelector("main");
    expect(main?.className).toContain("vhs-scanlines");
    expect(container.innerHTML).not.toContain("bg-gray-50");
    expect(container.innerHTML).not.toMatch(/\btext-gray-/);
  });

  it("renders the public page with VHS page chrome (R29)", async () => {
    usersFindFirst.mockResolvedValue({
      id: "pub-user",
      displayName: "Ana",
      avatarUrl: null,
      isPublic: true,
    });
    userMediaFindMany.mockResolvedValue([]);

    const { container } = render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "pub-user" }),
      })
    );

    const main = container.querySelector("main");
    expect(main?.className).toContain("vhs-scanlines");
    expect(main?.className).toContain("vhs-crt");
    expect(main?.className).toContain("min-h-screen");
  });

  it("renders recent-activity rows as VHS rows with no grey surfaces (R29/S13)", async () => {
    usersFindFirst.mockResolvedValue({
      id: "pub-user",
      displayName: "Ana",
      avatarUrl: null,
      isPublic: true,
    });
    userMediaFindMany
      .mockResolvedValueOnce([
        {
          id: "lm1",
          mediaItemId: "m1",
          status: "watching",
          rating: 8,
          progress: 2,
          updatedAt: new Date("2026-01-01T00:00:00Z"),
          mediaItem: {
            source: "tmdb",
            sourceId: "1",
            title: "Blade Runner",
            posterPath: null,
            type: "movie",
            runtime: 117,
          },
        },
      ])
      .mockResolvedValueOnce([{ id: "lm1", status: "watching" }]);

    const { container } = render(
      await PublicProfilePage({
        params: Promise.resolve({ lang: "en", id: "pub-user" }),
      })
    );

    expect(screen.getByText("Blade Runner")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
    const html = container.innerHTML;
    expect(html).not.toMatch(/\bbg-gray-/);
    expect(html).not.toMatch(/\btext-gray-/);
  });
});
