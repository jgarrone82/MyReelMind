import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SettingsPage from "./page";

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`Redirect to: ${url}`);
  }),
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
    getDictionary: vi.fn(async () => ({
      settings: {
        title: "Settings",
        kicker: "Member Desk",
        subtitle: "Update your card and clubhouse profile",
      },
    })),
  };
});

vi.mock("@/components/settings/SettingsForm", () => ({
  SettingsForm: ({ userId }: { userId: string }) => (
    <div data-testid="settings-form">{userId}</div>
  ),
}));

import { getAuthenticatedUser } from "@/lib/auth/server";

describe("SettingsPage auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when there is no authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    await expect(
      SettingsPage({ params: Promise.resolve({ lang: "en" }) })
    ).rejects.toThrow("Redirect to: /en/login");
  });

  it("renders the settings form bound to the revalidated user id", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "user-123",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);
    usersFindFirst.mockResolvedValue({
      id: "user-123",
      displayName: "Ana",
      avatarUrl: null,
      isPublic: true,
    });

    render(await SettingsPage({ params: Promise.resolve({ lang: "en" }) }));

    expect(screen.getByTestId("settings-form")).toHaveTextContent("user-123");
  });

  it("renders VHS page chrome: kicker, vhs-display heading, decorative subtitle", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "user-123",
    } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);
    usersFindFirst.mockResolvedValue({
      id: "user-123",
      displayName: "Ana",
      avatarUrl: null,
      isPublic: true,
    });

    const { container } = render(
      await SettingsPage({ params: Promise.resolve({ lang: "en" }) })
    );

    // Full-bleed VHS shell on <main>
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main).toHaveClass("vhs-scanlines", "vhs-crt", "min-h-screen");

    // Decorative kicker + subtitle copy from i18n
    expect(screen.getByText("Member Desk")).toBeInTheDocument();
    expect(
      screen.getByText(/Update your card and clubhouse profile/)
    ).toBeInTheDocument();

    // Heading uses the vhs-display utility (no grey shadcn token)
    const heading = screen.getByRole("heading", { name: "Settings" });
    expect(heading).toHaveClass("vhs-display");
    expect(heading.className).not.toMatch(/text-gray-/);
  });
});
