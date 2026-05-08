import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MediaDetailClient } from "./MediaDetailClient";

const mockUpdateStatus = vi.fn();
const mockUpdateRating = vi.fn();
const mockUpdateProgress = vi.fn();

vi.mock("@/actions/collection", () => ({
  updateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  updateRating: (...args: unknown[]) => mockUpdateRating(...args),
  updateProgress: (...args: unknown[]) => mockUpdateProgress(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const server = setupServer();

describe("MediaDetailClient", () => {
  const defaultProps = {
    mediaId: "tmdb-123",
    initialStatus: "want_to_watch" as const,
    initialProgress: 0,
    initialRating: null,
    episodes: 12,
    type: "anime" as const,
    dict: {
      collection: "Your Collection",
      status: {
        want_to_watch: "Want to Watch",
        watching: "Watching",
        completed: "Completed",
        paused: "Paused",
        dropped: "Dropped",
      },
      statusLabel: "Status",
      progress: "Progress",
      episode: "Episode",
      chapter: "Chapter",
      of: "of",
      rating: "Rating",
      yourRating: "Your Rating",
      notRated: "Not rated",
      clear: "Clear",
      markedCompleted: "Marked as completed",
      statusUpdated: "Status updated",
      ratingUpdated: "Rating updated",
      progressUpdated: "Progress updated",
    },
  };

  beforeAll(() => server.listen());
  afterEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });
  afterAll(() => server.close());

  describe("rendering", () => {
    it("renders all collection controls", async () => {
      mockUpdateStatus.mockResolvedValue({ success: true });
      mockUpdateRating.mockResolvedValue({ success: true });
      mockUpdateProgress.mockResolvedValue({ success: true });

      render(<MediaDetailClient {...defaultProps} />);

      expect(screen.getByLabelText("Watch status")).toBeInTheDocument();
      expect(screen.getByRole("group", { name: "Rating selection" })).toBeInTheDocument();
      expect(screen.getByLabelText("Progress")).toBeInTheDocument();
    });

    it("displays initial values correctly", () => {
      render(<MediaDetailClient {...defaultProps} />);

      expect(screen.getByLabelText("Watch status")).toHaveValue("want_to_watch");
      expect(screen.getByText("Not rated")).toBeInTheDocument();
      expect(screen.getByLabelText("Progress")).toHaveValue(0);
    });
  });

  describe("status update", () => {
    it("calls updateStatus action when status changes", async () => {
      const user = userEvent.setup();
      mockUpdateStatus.mockResolvedValue({ success: true });

      render(<MediaDetailClient {...defaultProps} />);

      const select = screen.getByLabelText("Watch status");
      await user.selectOptions(select, "watching");

      await waitFor(() => {
        expect(mockUpdateStatus).toHaveBeenCalledWith("tmdb-123", "watching");
      });
    });
  });

  describe("rating update", () => {
    it("calls updateRating action when rating is selected", async () => {
      const user = userEvent.setup();
      mockUpdateRating.mockResolvedValue({ success: true });

      render(<MediaDetailClient {...defaultProps} />);

      const ratingButton = screen.getByRole("button", { name: "Rate 8" });
      await user.click(ratingButton);

      await waitFor(() => {
        expect(mockUpdateRating).toHaveBeenCalledWith("tmdb-123", 8);
      });
    });
  });

  describe("progress update", () => {
    it("calls updateProgress action when progress changes", async () => {
      const user = userEvent.setup();
      mockUpdateProgress.mockResolvedValue({ success: true });

      render(<MediaDetailClient {...defaultProps} episodes={12} />);

      const input = screen.getByLabelText("Progress");
      await user.clear(input);
      await user.type(input, "5");

      await waitFor(() => {
        expect(mockUpdateProgress).toHaveBeenCalledWith("tmdb-123", 5, 12);
      });
    });
  });
});