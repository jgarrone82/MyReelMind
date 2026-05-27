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

vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      mediaItems: {
        findFirst: vi.fn(),
      },
      userMedia: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/components/collection/MediaDetailClient", () => ({
  MediaDetailClient: ({ initialStatus, initialProgress, initialRating }: {
    initialStatus: string;
    initialProgress: number;
    initialRating: number | null;
  }) => (
    <div data-testid="media-detail-client">
      Status: {initialStatus}, Progress: {initialProgress}, Rating: {initialRating ?? "none"}
    </div>
  ),
}));

import { fetchMediaDetail } from "@/lib/media/detail";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";

const mockMedia = {
  id: "tmdb-123",
  source: "tmdb" as const,
  type: "movie" as const,
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
  it("should render media details when found with user session", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(mockMedia);
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: "user-1",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "2024-01-01T00:00:00.000Z",
      },
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
      token_type: "bearer",
    } as unknown as Awaited<ReturnType<typeof getSession>>);
    vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue({
      id: "media-uuid-1",
      source: "tmdb",
      sourceId: "123",
      type: "movie",
      title: "Inception",
      originalTitle: null,
      overview: null,
      releaseDate: "2010",
      posterPath: null,
      backdropPath: null,
      genres: [],
      status: null,
      rawData: null,
      fetchedAt: new Date(),
      runtime: null,
      createdAt: new Date(),
    });
    vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
      id: "user-media-1",
      userId: "user-1",
      mediaItemId: "media-uuid-1",
      status: "watching" as const,
      progress: 5,
      rating: 8,
      notes: null,
      dates: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    expect(screen.getByTestId("media-detail-client")).toBeInTheDocument();
  });

  it("should render without collection controls when not authenticated", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(mockMedia);
    vi.mocked(getSession).mockResolvedValue(null);

    const page = await MediaDetailPage({
      params: Promise.resolve({ lang: "en", id: "tmdb-123" }),
    });

    render(page);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.queryByTestId("media-detail-client")).not.toBeInTheDocument();
  });

  it("should call notFound when media is missing", async () => {
    vi.mocked(fetchMediaDetail).mockResolvedValue(null);
    vi.mocked(getSession).mockResolvedValue(null);

    await expect(
      MediaDetailPage({
        params: Promise.resolve({ lang: "en", id: "tmdb-999" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(vi.mocked(fetchMediaDetail)).toHaveBeenCalledWith("tmdb-999");
  });
});