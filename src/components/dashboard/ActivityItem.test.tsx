import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityItem } from "./ActivityItem";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";

describe("ActivityItem", () => {
  it("should render media title", () => {
    const mockActivity = {
      id: "um-1",
      status: "completed" as const,
      progress: 12,
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        title: "Inception",
        type: "movie" as const,
        posterPath: null,
      },
    };

    render(<ActivityItem activity={mockActivity} />);

    expect(screen.getByText("Inception")).toBeInTheDocument();
  });

  it("should render status label", () => {
    const mockActivity = {
      id: "um-1",
      status: "completed" as const,
      progress: 12,
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        title: "Inception",
        type: "movie" as const,
        posterPath: null,
      },
    };

    render(<ActivityItem activity={mockActivity} />);

    expect(screen.getByText("Completado")).toBeInTheDocument();
  });

  it("should render progress when available", () => {
    const mockActivity = {
      id: "um-1",
      status: "watching" as const,
      progress: 5,
      updatedAt: new Date(),
      mediaItem: {
        id: "media-1",
        title: "Attack on Titan",
        type: "anime" as const,
        posterPath: null,
      },
    };

    render(<ActivityItem activity={mockActivity} />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render relative time", () => {
    const mockActivity = {
      id: "um-1",
      status: "completed" as const,
      progress: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      mediaItem: {
        id: "media-1",
        title: "Movie",
        type: "movie" as const,
        posterPath: null,
      },
    };

    render(<ActivityItem activity={mockActivity} />);

    expect(screen.getByText(/hace/i)).toBeInTheDocument();
  });
});