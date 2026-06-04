import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LibraryItem } from "./LibraryItem";
import { updateStatus, updateRating, updateProgress } from "@/actions/collection";

vi.mock("@/actions/collection", () => ({
  updateStatus: vi.fn(),
  updateRating: vi.fn(),
  updateProgress: vi.fn(),
  removeFromLibrary: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// LibraryItem (and its nested RemoveButton) now read `useQueryClient()` to
// invalidate library-state after a successful badge-affecting mutation (#42 D8).
function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
  return { ...result, queryClient, invalidateSpy };
}

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
    renderWithClient(<LibraryItem {...baseProps} />);
    expect(screen.getByText("Test Movie")).toBeInTheDocument();
  });

  it("should render status selector", () => {
    renderWithClient(<LibraryItem {...baseProps} />);
    expect(screen.getByRole("combobox", { name: /watch status/i })).toHaveValue("watching");
  });

  it("should render remove button", () => {
    renderWithClient(<LibraryItem {...baseProps} />);
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("should show confirmation dialog when remove is clicked", async () => {
    const user = userEvent.setup();
    renderWithClient(<LibraryItem {...baseProps} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("Remove this item?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  describe("library-state invalidation (#42 D8)", () => {
    it("invalidates the library-state cache after a successful status update", async () => {
      const user = userEvent.setup();
      vi.mocked(updateStatus).mockResolvedValue({ success: true } as never);

      const { invalidateSpy } = renderWithClient(<LibraryItem {...baseProps} />);

      await user.selectOptions(
        screen.getByRole("combobox", { name: /watch status/i }),
        "completed"
      );

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["library-state"],
        });
      });
    });

    it("does NOT invalidate when the status update fails", async () => {
      const user = userEvent.setup();
      vi.mocked(updateStatus).mockResolvedValue({
        success: false,
        error: "nope",
      } as never);

      const { invalidateSpy } = renderWithClient(<LibraryItem {...baseProps} />);

      await user.selectOptions(
        screen.getByRole("combobox", { name: /watch status/i }),
        "completed"
      );

      await waitFor(() => {
        expect(updateStatus).toHaveBeenCalled();
      });
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    // Only status/add/remove can move a search-results badge between bands; a
    // rating change never does, so a SUCCESSFUL rating mutation must NOT
    // invalidate the library-state cache (#42 D8 call-site inventory).
    it("does NOT invalidate library-state after a successful rating update", async () => {
      const user = userEvent.setup();
      vi.mocked(updateRating).mockResolvedValue({ success: true } as never);

      const { invalidateSpy } = renderWithClient(<LibraryItem {...baseProps} />);

      await user.click(screen.getByRole("button", { name: "Rate 8" }));

      await waitFor(() => {
        expect(updateRating).toHaveBeenCalledWith("tmdb-123", 8);
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: ["library-state"],
      });
    });

    // A progress change likewise never moves the badge band, so a SUCCESSFUL
    // progress mutation must NOT invalidate library-state. ProgressTracker only
    // renders for non-movie media with a positive runtime, so use an anime item.
    it("does NOT invalidate library-state after a successful progress update", async () => {
      const user = userEvent.setup();
      vi.mocked(updateProgress).mockResolvedValue({ success: true } as never);

      const { invalidateSpy } = renderWithClient(
        <LibraryItem {...baseProps} type="anime" runtime={12} progress={0} />
      );

      const input = screen.getByLabelText("Progress");
      await user.clear(input);
      await user.type(input, "5");

      await waitFor(() => {
        expect(updateProgress).toHaveBeenCalledWith("tmdb-123", 5, 12);
      });
      expect(invalidateSpy).not.toHaveBeenCalledWith({
        queryKey: ["library-state"],
      });
    });
  });
});