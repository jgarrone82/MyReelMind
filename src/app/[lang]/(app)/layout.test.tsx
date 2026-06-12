import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { getAuthenticatedUser } from "@/lib/auth/server";
import AppLayout from "./layout";

/**
 * AppLayout is the app-chrome shell: an async Server Component that renders the
 * VhsHeader (always) and the member AppTabBar (Home/Search/Library/Settings).
 *
 * Contract under test (issue #78): a logged-OUT visitor must NOT see the member
 * TabBar — its protected tabs only bounce to login. The TabBar is gated on the
 * SAME revalidated signal DashboardContent uses (getAuthenticatedUser), so the
 * chrome and the page content never disagree for a stale token. The VhsHeader
 * stays unconditional (its UserMenu already renders null for a guest).
 *
 * We render the layout as the project renders async Server Components elsewhere
 * (page.test.tsx): invoke it with a resolved `params`, await the returned
 * element, then `render(...)` it.
 *
 * Seams mocked:
 *  - @/lib/auth/server → drive the auth branch (null vs a fake User).
 *  - @/i18n            → deterministic dictionary (brand + nav only).
 *  - VhsHeader / UserMenu / AppTabBar → stubbed. The real VhsHeader nests
 *    <UserMenu>, an async Client Component the jsdom renderer cannot resolve
 *    synchronously (it suspends and the subtree drops out — the documented RSC
 *    nesting limitation). The layout's only job is the conditional WHICH
 *    children it renders, so we assert on stable stub markers. AppTabBar's own
 *    internals (active tab, hrefs) are covered by its dedicated unit test.
 */

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

const DICT = {
  brand: {
    name: "MyReelMind",
    sub: "RENTAL · EST 1985",
    openLabel: "Open",
  },
  nav: {
    home: "Home",
    search: "Search",
    library: "My Library",
    dashboard: "Dashboard",
    settings: "Settings",
  },
} as never;

vi.mock("@/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/i18n")>("@/i18n");
  return {
    ...actual,
    getDictionary: vi.fn(async () => DICT),
  };
});

vi.mock("@/components/vhs/Header", () => ({
  VhsHeader: () => <header data-testid="vhs-header" />,
}));

vi.mock("@/components/auth/UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

vi.mock("@/components/vhs/AppTabBar", () => ({
  // Stable marker that distinguishes "TabBar present" from "absent"; mirrors
  // the real component's <nav> landmark without pulling in usePathname.
  AppTabBar: () => <nav data-testid="app-tabbar" aria-label="Primary" />,
}));

const tabBar = () => screen.queryByTestId("app-tabbar");
const header = () => screen.queryByTestId("vhs-header");

describe("AppLayout — member TabBar visibility (issue #78)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hides the member TabBar for an anonymous visitor (keeps the VhsHeader)", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

    const ui = await AppLayout({
      children: <div data-testid="page-content">page</div>,
      params: Promise.resolve({ lang: "en" }),
    });
    render(ui);

    // The protected member tab bar must NOT render for a guest.
    expect(tabBar()).not.toBeInTheDocument();
    // The header stays unconditional; children still render.
    expect(header()).toBeInTheDocument();
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders the member TabBar for an authenticated user", async () => {
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      id: "user-123",
      email: "member@example.com",
    } as never);

    const ui = await AppLayout({
      children: <div data-testid="page-content">page</div>,
      params: Promise.resolve({ lang: "en" }),
    });
    render(ui);

    // The member tab bar renders for a logged-in user.
    expect(tabBar()).toBeInTheDocument();
    // Header + children still render alongside it.
    expect(header()).toBeInTheDocument();
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });
});
