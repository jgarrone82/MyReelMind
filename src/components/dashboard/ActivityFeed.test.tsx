import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityFeed } from "./ActivityFeed";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";

describe("ActivityFeed", () => {
  it("should render empty state when no activities", () => {
    render(<ActivityFeed activities={[]} />);

    expect(screen.getByText(/no tenés actividad aún/i)).toBeInTheDocument();
  });

  it("should render activities list", () => {
    const mockActivities: UserMediaWithMedia[] = [
      {
        id: "um-1",
        status: "completed",
        progress: 0,
        updatedAt: new Date(),
        mediaItem: {
          id: "media-1",
          title: "Inception",
          type: "movie",
          posterPath: null,
        },
      },
      {
        id: "um-2",
        status: "watching",
        progress: 5,
        updatedAt: new Date(),
        mediaItem: {
          id: "media-2",
          title: "Attack on Titan",
          type: "anime",
          posterPath: null,
        },
      },
    ];

    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Attack on Titan")).toBeInTheDocument();
  });

  it("should render correct number of activities", () => {
    const mockActivities: UserMediaWithMedia[] = [
      {
        id: "um-1",
        status: "completed",
        progress: 0,
        updatedAt: new Date(),
        mediaItem: { id: "media-1", title: "Movie 1", type: "movie", posterPath: null },
      },
      {
        id: "um-2",
        status: "watching",
        progress: 3,
        updatedAt: new Date(),
        mediaItem: { id: "media-2", title: "Movie 2", type: "movie", posterPath: null },
      },
      {
        id: "um-3",
        status: "paused",
        progress: 10,
        updatedAt: new Date(),
        mediaItem: { id: "media-3", title: "Movie 3", type: "movie", posterPath: null },
      },
    ];

    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByText("Movie 1")).toBeInTheDocument();
    expect(screen.getByText("Movie 2")).toBeInTheDocument();
    expect(screen.getByText("Movie 3")).toBeInTheDocument();
  });
});