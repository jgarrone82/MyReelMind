import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AddToLibraryButton } from "./AddToLibraryButton";

const mockAddToLibrary = vi.fn();

vi.mock("@/actions/collection", () => ({
  addToLibrary: (...args: unknown[]) => mockAddToLibrary(...args),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// The component reads `useQueryClient()` to invalidate library-state after a
// successful add (#42 D8). Render under a real client + spy on
// `invalidateQueries`.
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

describe("AddToLibraryButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls addToLibrary with the media id and want_to_watch status", async () => {
    const user = userEvent.setup();
    mockAddToLibrary.mockResolvedValue({ success: true });

    renderWithClient(<AddToLibraryButton mediaId="tmdb-1" label="Add" />);

    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(mockAddToLibrary).toHaveBeenCalledWith("tmdb-1", "want_to_watch");
    });
  });

  describe("library-state invalidation (#42 D8)", () => {
    it("invalidates the library-state cache after a successful add", async () => {
      const user = userEvent.setup();
      mockAddToLibrary.mockResolvedValue({ success: true });

      const { invalidateSpy } = renderWithClient(
        <AddToLibraryButton mediaId="tmdb-1" label="Add" />
      );

      await user.click(screen.getByRole("button", { name: "Add" }));

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["library-state"],
        });
      });
    });

    it("does NOT invalidate when the add fails", async () => {
      const user = userEvent.setup();
      mockAddToLibrary.mockResolvedValue({ success: false, error: "nope" });

      const { invalidateSpy } = renderWithClient(
        <AddToLibraryButton mediaId="tmdb-1" label="Add" />
      );

      await user.click(screen.getByRole("button", { name: "Add" }));

      await waitFor(() => {
        expect(mockAddToLibrary).toHaveBeenCalled();
      });
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
