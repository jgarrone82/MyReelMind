import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/api/merge";

const mockMovie: MediaItem = {
  id: "tmdb-123",
  source: "tmdb",
  type: "movie",
  title: "Inception",
  originalTitle: null,
  year: 2010,
  description: "A mind-bending thriller",
  score: 88,
  popularity: 100,
  coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
  bannerImage: null,
  genres: ["Sci-Fi", "Action"],
};

const mockAnime: MediaItem = {
  id: "anilist-456",
  source: "anilist",
  type: "anime",
  title: "Attack on Titan",
  originalTitle: "進撃の巨人",
  year: 2013,
  description: "Humanity fights titans",
  score: 92,
  popularity: 200,
  coverImage: "https://example.com/cover.jpg",
  bannerImage: null,
  genres: ["Action", "Drama"],
  episodes: 25,
};

const mockNoImage: MediaItem = {
  id: "tmdb-789",
  source: "tmdb",
  type: "tv",
  title: "The Office",
  originalTitle: null,
  year: 2005,
  description: "A mockumentary",
  score: null,
  popularity: null,
  coverImage: null,
  bannerImage: null,
  genres: [],
};

describe("MediaCard", () => {
  it("should render title and year", () => {
    render(<MediaCard media={mockMovie} />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
  });

  it("should render source badge", () => {
    render(<MediaCard media={mockMovie} />);

    expect(screen.getByText("TMDB")).toBeInTheDocument();
  });

  it("should render poster image with alt text when available", () => {
    render(<MediaCard media={mockMovie} />);

    const img = screen.getByRole("img", { name: /inception poster/i });
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain(encodeURIComponent(mockMovie.coverImage!));
  });

  it("should render fallback when poster is missing", () => {
    render(<MediaCard media={mockNoImage} />);

    expect(
      screen.getByRole("img", { name: /the office poster/i })
    ).toBeInTheDocument();
  });

  it("should render anime-specific info", () => {
    render(<MediaCard media={mockAnime} />);

    expect(screen.getByText("Attack on Titan")).toBeInTheDocument();
    expect(screen.getByText("AniList")).toBeInTheDocument();
  });
});
