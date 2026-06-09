import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppTabBar } from "../AppTabBar";

// usePathname is the ONLY source of active-state (no useSearchParams → no CSR
// Suspense bailout). Mock it per test to drive the active-tab assertions.
const usePathname = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

const nav = {
  home: "Home",
  search: "Search",
  library: "My Library",
  dashboard: "Dashboard",
  settings: "Settings",
};

function renderTabBar(pathname: string) {
  usePathname.mockReturnValue(pathname);
  return render(<AppTabBar lang="en" nav={nav} />);
}

describe("AppTabBar", () => {
  beforeEach(() => {
    usePathname.mockReset();
  });

  it("marks Home active on /en", () => {
    renderTabBar("/en");
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /search/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Search active on /en/search", () => {
    renderTabBar("/en/search");
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /home/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Library active on /en/library", () => {
    renderTabBar("/en/library");
    expect(
      screen.getByRole("link", { name: /my library/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("marks Settings active on /en/settings", () => {
    renderTabBar("/en/settings");
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks no tab active on detail routes like /en/media/123", () => {
    renderTabBar("/en/media/123");
    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link).not.toHaveAttribute("aria-current", "page");
    }
  });

  it("renders exactly 4 tab links with locale-prefixed hrefs", () => {
    renderTabBar("/en");
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/en",
    );
    expect(screen.getByRole("link", { name: /search/i })).toHaveAttribute(
      "href",
      "/en/search",
    );
    expect(screen.getByRole("link", { name: /my library/i })).toHaveAttribute(
      "href",
      "/en/library",
    );
    expect(screen.getByRole("link", { name: /settings/i })).toHaveAttribute(
      "href",
      "/en/settings",
    );
  });
});
