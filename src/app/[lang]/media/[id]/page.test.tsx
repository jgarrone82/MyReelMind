import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MediaDetailPage from "./page";

vi.mock("@/lib/media/detail", () => ({
  fetchMediaDetail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { notFound } from "next/navigation";

vi.mock("@/components/collection/StatusSelector", () => ({
  StatusSelector: ({ status }: { status: string }) => (
    <div data-testid="status-selector">Status: {status}</div>
  ),
}));

vi.mock("@/components/collection/RatingInput", () => ({
  RatingInput: ({ rating }: { rating: number | null }) => (
    <div data-testid="rating-input">Rating: {rating ?? "none"}</div>
  ),
}));

vi.mock("@/components/collection/ProgressTracker", () => ({
  ProgressTracker: ({ progress }: { progress: number }) => (
    <div data-testid="progress-tracker">Progress: {progress}</div>
  ),
}));

import { fetchMediaDetail } from "@/lib/media/detail";

const mockMedia = {
  id: "tmdb-123",
  source: "tmdb",
  type: "movie",
  title: "Inception",
  originalTitle: "Inception",
  year: 2010,
  description: "A mind-bending thriller about dreams within dreams.",
  score: 88,
  popularity: 100,
  coverImage: "https://image.tmdb.org/t/p/w500/poster.jpg",
  bannerImage: "https://image.tmdb.org/t/p/original/backdrop.jpg",
  genres: ["Sci-Fi", "Action", "Thriller"],
};

describe("MediaDetailPage", () => {
  it("should render media details when found", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(mockMedia);

    const page = await MediaDetailPage({
      params: Promise.resolve({ lang: "en", id: "tmdb-123" }),
    });

    render(page);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText(/mind-bending thriller/i)).toBeInTheDocument();
    expect(screen.getByText("2010")).toBeInTheDocument();
    expect(screen.getByText("TMDB")).toBeInTheDocument();
    expect(screen.getByText("Sci-Fi")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByTestId("status-selector")).toBeInTheDocument();
    expect(screen.getByTestId("rating-input")).toBeInTheDocument();
    expect(screen.getByTestId("progress-tracker")).toBeInTheDocument();
  });

  it("should call notFound when media is missing", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(null);

    await expect(
      MediaDetailPage({
        params: Promise.resolve({ lang: "en", id: "tmdb-999" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });
});
