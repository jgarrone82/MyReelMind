import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TypeFilterChips } from "@/components/library/TypeFilterChips";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const baseProps = {
  lang: "en" as const,
  currentType: null,
  currentStatus: null,
  dict: {
    allTypes: "All Types",
    filterMovie: "Movies",
    filterTv: "TV Shows",
    filterAnime: "Anime",
  },
};

describe("TypeFilterChips", () => {
  it("should render 4 chips (All, Movies, TV, Anime)", () => {
    render(<TypeFilterChips {...baseProps} />);
    expect(screen.getByText("All Types")).toBeInTheDocument();
    expect(screen.getByText("Movies")).toBeInTheDocument();
    expect(screen.getByText("TV Shows")).toBeInTheDocument();
    expect(screen.getByText("Anime")).toBeInTheDocument();
  });

  it("should highlight the active chip", () => {
    render(<TypeFilterChips {...baseProps} currentType="movie" />);
    const movieChip = screen.getByText("Movies").closest("a");
    expect(movieChip).toHaveClass("bg-accent", "text-accent-foreground");
  });

  it("should preserve status param in links", () => {
    render(<TypeFilterChips {...baseProps} currentStatus="watching" />);
    const allLink = screen.getByText("All Types").closest("a");
    expect(allLink?.getAttribute("href")).toBe("/en/library?status=watching");
  });

  it("should include type param in links when active", () => {
    render(<TypeFilterChips {...baseProps} currentStatus="watching" currentType="anime" />);
    const animeLink = screen.getByText("Anime").closest("a");
    expect(animeLink?.getAttribute("href")).toBe("/en/library?status=watching&type=anime");
  });

  it("should link to root library when All is clicked with no type", () => {
    render(<TypeFilterChips {...baseProps} currentType="movie" />);
    const allLink = screen.getByText("All Types").closest("a");
    expect(allLink?.getAttribute("href")).toBe("/en/library");
  });
});