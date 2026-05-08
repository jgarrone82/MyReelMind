import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryItem } from "./LibraryItem";

vi.mock("@/actions/collection", () => ({
  updateStatus: vi.fn(),
  updateRating: vi.fn(),
  updateProgress: vi.fn(),
  removeFromLibrary: vi.fn(),
}));

const baseProps = {
  id: "um-1",
  mediaId: "tmdb-123",
  publicId: "tmdb-123",
  title: "Test Movie",
  posterPath: "/poster.jpg",
  status: "watching" as const,
  progress: 5,
  rating: null as number | null,
  type: "movie" as const,
  runtime: 120,
  lang: "en",
  dict: {
    remove: "Remove",
    removeConfirm: "Remove this item?",
    noEpisodes: "No episodes",
    statusUpdated: "Status updated",
    ratingUpdated: "Rating updated",
    progressUpdated: "Progress updated",
    removed: "Removed",
    error: "Error",
    status: {
      want_to_watch: "Want to Watch",
      watching: "Watching",
      completed: "Completed",
      paused: "Paused",
      dropped: "Dropped",
    },
    statusLabel: "Status",
    rating: "Rating",
    yourRating: "Your Rating",
    notRated: "Not rated",
    clear: "Clear",
    progress: "Progress",
    episode: "Episode",
    chapter: "Chapter",
    of: "of",
  },
};

describe("LibraryItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render title and poster", () => {
    render(<LibraryItem {...baseProps} />);
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("should render status selector", () => {
    render(<LibraryItem {...baseProps} />);
    expect(screen.getByRole("combobox", { name: /watch status/i })).toHaveValue("watching");
  });

  it("should render remove button", () => {
    render(<LibraryItem {...baseProps} />);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("should show confirmation dialog when remove is clicked", async () => {
    const user = userEvent.setup();
    render(<LibraryItem {...baseProps} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("Remove this item?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});