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
      },
      media: { status: {} },
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
});
