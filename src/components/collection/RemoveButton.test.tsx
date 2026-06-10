import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { RemoveButton } from "./RemoveButton";

const mockRemoveFromLibrary = vi.fn();

vi.mock("@/actions/collection", () => ({
  removeFromLibrary: (...args: unknown[]) => mockRemoveFromLibrary(...args),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// The component reads `useQueryClient()` to invalidate library-state after a
// successful removal (#42 D8). Render under a real client + spy on
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

const dict = {
  remove: "Remove",
  removeConfirm: "Remove this item?",
  cancel: "Cancel",
  error: "Error",
};

describe("RemoveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a confirm dialog before removing", async () => {
    const user = userEvent.setup();
    renderWithClient(<RemoveButton mediaId="tmdb-1" dict={dict} />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("Remove this item?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("calls removeFromLibrary and onSuccess after a confirmed removal", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockRemoveFromLibrary.mockResolvedValue({ success: true });

    renderWithClient(
      <RemoveButton mediaId="tmdb-1" dict={dict} onSuccess={onSuccess} />
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    // The confirm form's submit button is also labeled "Remove".
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    await waitFor(() => {
      expect(mockRemoveFromLibrary).toHaveBeenCalledWith("tmdb-1");
    });
    expect(onSuccess).toHaveBeenCalled();
  });

  // GUARD (committed before the C2 VHS restyle, S2): the destructive-treatment
  // restyle MUST NOT add, remove, reorder, or rename the #42 D8 invalidation.
  // The exact object-form call `invalidateQueries({ queryKey: ["library-state"] })`
  // AND the onSuccess callback must both survive verbatim.
  describe("library-state invalidation (#42 D8)", () => {
    it("invalidates the library-state cache after a successful removal", async () => {
      const user = userEvent.setup();
      mockRemoveFromLibrary.mockResolvedValue({ success: true });
      const onSuccess = vi.fn();

      const { invalidateSpy } = renderWithClient(
        <RemoveButton mediaId="tmdb-1" dict={dict} onSuccess={onSuccess} />
      );

      await user.click(screen.getByRole("button", { name: "Remove" }));
      await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ["library-state"],
        });
      });
      // S2: onSuccess fires on the same success path as the invalidation.
      expect(onSuccess).toHaveBeenCalled();
    });

    it("does NOT invalidate when the removal fails", async () => {
      const user = userEvent.setup();
      mockRemoveFromLibrary.mockResolvedValue({ success: false, error: "nope" });

      const { invalidateSpy } = renderWithClient(
        <RemoveButton mediaId="tmdb-1" dict={dict} />
      );

      await user.click(screen.getByRole("button", { name: "Remove" }));
      await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

      await waitFor(() => {
        expect(mockRemoveFromLibrary).toHaveBeenCalled();
      });
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
