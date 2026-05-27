import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaGrid } from "./MediaGrid";
import type { MediaItem } from "@/lib/api/merge";

const mockItems: MediaItem[] = [
  {
    id: "tmdb-1",
    source: "tmdb",
    type: "movie",
    title: "Movie One",
    originalTitle: null,
    year: 2020,
    description: null,
    score: null,
    popularity: null,
    coverImage: null,
    bannerImage: null,
    genres: [],
  },
  {
    id: "anilist-2",
    source: "anilist",
    type: "anime",
    title: "Anime Two",
    originalTitle: null,
    year: 2021,
    description: null,
    score: null,
    popularity: null,
    coverImage: null,
    bannerImage: null,
    genres: [],
  },
];

describe("MediaGrid", () => {
  it("should render cards for each media item", () => {
    render(<MediaGrid items={mockItems} />);

    expect(screen.getByText("Movie One")).toBeInTheDocument();
    expect(screen.getByText("Anime Two")).toBeInTheDocument();
  });

  it("should show empty state when no items", () => {
    render(<MediaGrid items={[]} noResults="No results" />);

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("should apply responsive grid classes", () => {
    const { container } = render(<MediaGrid items={mockItems} />);

    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("grid");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("sm:grid-cols-2");
    expect(grid.className).toContain("lg:grid-cols-4");
  });
});
