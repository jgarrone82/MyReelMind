import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityItem } from "./ActivityItem";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import { mockDictionary } from "@tests/fixtures/mockDictionary";

const mockDict = mockDictionary.media;

describe("ActivityItem", () => {
  it("should render media title", () => {
    const mockActivity = {
      id: "um-1",
      userId: "user-1",
      mediaItemId: "media-1",
      status: "completed" as const,
      progress: 12,
      rating: null,
      notes: null,
      dates: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        source: "tmdb" as const,
        sourceId: "123",
        type: "movie" as const,
        title: "Inception",
        originalTitle: null,
        overview: null,
        overviews: null,
        releaseDate: null,
        posterPath: null,
        backdropPath: null,
        genres: [],
        runtime: 120,
        status: null,
        rawData: null,
        fetchedAt: new Date(),
        createdAt: new Date(),
      },
    } satisfies UserMediaWithMedia;

    render(<ActivityItem activity={mockActivity} dict={mockDict} lang="es" />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("should render status label", () => {
    const mockActivity = {
      id: "um-1",
      userId: "user-1",
      mediaItemId: "media-1",
      status: "completed" as const,
      progress: 12,
      rating: null,
      notes: null,
      dates: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        source: "tmdb" as const,
        sourceId: "123",
        type: "movie" as const,
        title: "Inception",
        originalTitle: null,
        overview: null,
        overviews: null,
        releaseDate: null,
        posterPath: null,
        backdropPath: null,
        genres: [],
        runtime: 120,
        status: null,
        rawData: null,
        fetchedAt: new Date(),
        createdAt: new Date(),
      },
    } satisfies UserMediaWithMedia;

    render(<ActivityItem activity={mockActivity} dict={mockDict} lang="es" />);

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should render progress when available", () => {
    const mockActivity = {
      id: "um-1",
      userId: "user-1",
      mediaItemId: "media-1",
      status: "watching" as const,
      progress: 5,
      rating: null,
      notes: null,
      dates: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        source: "tmdb" as const,
        sourceId: "123",
        type: "anime" as const,
        title: "Attack on Titan",
        originalTitle: null,
        overview: null,
        overviews: null,
        releaseDate: null,
        posterPath: null,
        backdropPath: null,
        genres: [],
        runtime: 120,
        status: null,
        rawData: null,
        fetchedAt: new Date(),
        createdAt: new Date(),
      },
    } satisfies UserMediaWithMedia;

    render(<ActivityItem activity={mockActivity} dict={mockDict} lang="es" />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render relative time", () => {
    const mockActivity = {
      id: "um-1",
      userId: "user-1",
      mediaItemId: "media-1",
      status: "completed" as const,
      progress: 0,
      rating: null,
      notes: null,
      dates: null,
      createdAt: new Date(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60),
      mediaItem: {
        id: "media-1",
        source: "tmdb" as const,
        sourceId: "123",
        type: "movie" as const,
        title: "Movie",
        originalTitle: null,
        overview: null,
        overviews: null,
        releaseDate: null,
        posterPath: null,
        backdropPath: null,
        genres: [],
        runtime: 120,
        status: null,
        rawData: null,
        fetchedAt: new Date(),
        createdAt: new Date(),
      },
    } satisfies UserMediaWithMedia;

    render(<ActivityItem activity={mockActivity} dict={mockDict} lang="es" />);

    expect(screen.getByText(/hace/i)).toBeInTheDocument();
  });
});
