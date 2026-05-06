import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LibraryGrid } from "./LibraryGrid";

vi.mock("@/actions/collection", () => ({
  updateStatus: vi.fn(),
  updateRating: vi.fn(),
  updateProgress: vi.fn(),
  removeFromLibrary: vi.fn(),
}));

const baseItems = [
  {
    id: "um-1",
    mediaItemId: "mi-1",
    publicId: "tmdb-123",
    status: "watching" as const,
    progress: 5,
    rating: null as number | null,
    updatedAt: new Date().toISOString(),
    mediaItem: {
      source: "tmdb" as const,
      sourceId: "123",
      title: "Test Movie 1",
      posterPath: "/poster1.jpg",
      type: "movie" as const,
      runtime: 120,
    },
  },
  {
    id: "um-2",
    mediaItemId: "mi-2",
    publicId: "anilist-456",
    status: "completed" as const,
    progress: 24,
    rating: 8 as number | null,
    updatedAt: new Date().toISOString(),
    mediaItem: {
      source: "anilist" as const,
      sourceId: "456",
      title: "Test Anime",
      posterPath: "/poster2.jpg",
      type: "anime" as const,
      runtime: 24,
    },
  },
];

const baseProps = {
  lang: "en" as const,
  dict: {
    remove: "Remove",
    removeConfirm: "Remove this item?",
    noEpisodes: "No episodes",
  },
};

describe("LibraryGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all items", () => {
    render(<LibraryGrid items={baseItems} {...baseProps} />);
    expect(screen.getByText("Test Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Test Anime")).toBeInTheDocument();
  });

  it("should return null when items array is empty", () => {
    const { container } = render(<LibraryGrid items={[]} {...baseProps} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render with correct number of items", () => {
    render(<LibraryGrid items={baseItems} {...baseProps} />);
    expect(screen.getByText("Test Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Test Anime")).toBeInTheDocument();
  });
});