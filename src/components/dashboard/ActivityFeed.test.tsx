import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityFeed } from "./ActivityFeed";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import { mockDictionary } from "@tests/fixtures/mockDictionary";

const mockDashboardDict = mockDictionary.dashboard;
const mockMediaDict = mockDictionary.media;

function createMockActivity(overrides: Partial<UserMediaWithMedia> = {}): UserMediaWithMedia {
  return {
    id: "um-1",
    userId: "user-1",
    mediaItemId: "media-1",
    status: "completed",
    progress: 0,
    rating: null,
    notes: null,
    dates: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    mediaItem: {
      id: "media-1",
      source: "tmdb",
      sourceId: "123",
      type: "movie",
      title: "Inception",
      originalTitle: null,
      overview: null,
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
    ...overrides,
  } as UserMediaWithMedia;
}

describe("ActivityFeed", () => {
  it("should render empty state when no activities", () => {
    render(
      <ActivityFeed
        activities={[]}
        dict={mockDashboardDict}
        mediaDict={mockMediaDict}
      />
    );

    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("should render activities list", () => {
    const mockActivities: UserMediaWithMedia[] = [
      createMockActivity({
        id: "um-1",
        mediaItem: {
          id: "media-1",
          source: "tmdb",
          sourceId: "123",
          type: "movie",
          title: "Inception",
          originalTitle: null,
          overview: null,
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
      }),
      createMockActivity({
        id: "um-2",
        status: "watching",
        progress: 5,
        mediaItem: {
          id: "media-2",
          source: "tmdb",
          sourceId: "456",
          type: "anime",
          title: "Attack on Titan",
          originalTitle: null,
          overview: null,
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
      }),
    ];

    render(
      <ActivityFeed
        activities={mockActivities}
        dict={mockDashboardDict}
        mediaDict={mockMediaDict}
      />
    );

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Attack on Titan")).toBeInTheDocument();
  });

  it("should render correct number of activities", () => {
    const mockActivities: UserMediaWithMedia[] = [
      createMockActivity({
        id: "um-1",
        mediaItem: {
          id: "media-1",
          source: "tmdb",
          sourceId: "123",
          type: "movie",
          title: "Movie 1",
          originalTitle: null,
          overview: null,
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
      }),
      createMockActivity({
        id: "um-2",
        status: "watching",
        progress: 3,
        mediaItem: {
          id: "media-2",
          source: "tmdb",
          sourceId: "456",
          type: "movie",
          title: "Movie 2",
          originalTitle: null,
          overview: null,
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
      }),
      createMockActivity({
        id: "um-3",
        status: "paused",
        progress: 10,
        mediaItem: {
          id: "media-3",
          source: "tmdb",
          sourceId: "789",
          type: "movie",
          title: "Movie 3",
          originalTitle: null,
          overview: null,
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
      }),
    ];

    render(
      <ActivityFeed
        activities={mockActivities}
        dict={mockDashboardDict}
        mediaDict={mockMediaDict}
      />
    );

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Movie 2")).toBeInTheDocument();
    expect(screen.getByText("Movie 3")).toBeInTheDocument();
  });
});
