import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchBar } from "./SearchBar";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

// Mock the search query so the loading state is driven explicitly and no
// accidental /api/search request escapes into MSW (onUnhandledRequest: "error").
vi.mock("@/hooks/queries/useSearch");

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("SearchBar", () => {
  beforeEach(() => {
    vi.mocked(useSearch).mockReturnValue({ isFetching: false } as ReturnType<
      typeof useSearch
    >);
    useSearchFilters.setState({
      query: "",
      debouncedQuery: "",
      type: "all",
      year: null,
      page: 1,
    });
  });

  it("should render search input only (type filter moved to chips)", () => {
    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    expect(
      screen.getByRole("searchbox", { name: /search/i })
    ).toBeInTheDocument();
    // Type filter is now a separate TypeFilterChips component
    expect(screen.queryByRole("combobox", { name: /type/i })).not.toBeInTheDocument();
  });

  it("labels the search input exactly once, with no redundant ARIA", () => {
    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });

    // type="search" already maps to the implicit searchbox role, so a
    // redundant explicit role must not be set.
    expect(input).not.toHaveAttribute("role");
    // The visible <label for> is the sole labelling source; the redundant
    // aria-label that shadowed it must be gone (no double labelling).
    expect(input).not.toHaveAttribute("aria-label");
    expect(input).toHaveAttribute("id", "search-input");
  });

  it("should not render a CLEAR button when the query is empty", () => {
    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.queryByRole("button", { name: /clear search/i })
    ).not.toBeInTheDocument();
  });

  it("should render a CLEAR button when the query is non-empty", () => {
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole("button", { name: /clear search/i })
    ).toBeInTheDocument();
  });

  it("should clear the query in the store when CLEAR is clicked", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(useSearchFilters.getState().query).toBe("");
    // CLEAR must also reset debouncedQuery instantly (no debounce wait), so the
    // results view collapses immediately. Pins the setDebouncedQuery("") call.
    expect(useSearchFilters.getState().debouncedQuery).toBe("");
  });

  it("should update query in store when user types", async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    expect(useSearchFilters.getState().query).toBe("naruto");
  });

  it("should debounce query update to debouncedQuery", async () => {
    const user = userEvent.setup();
    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    // Immediately, debouncedQuery should not be set
    expect(useSearchFilters.getState().debouncedQuery).toBe("");

    // After debounce timeout, it should be set
    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("naruto")
    );
  });

  it("should show loading state when search is fetching", () => {
    // Drive the loading state explicitly via the mocked query, instead of
    // relying on React Query's transient initial isFetching plus an
    // accidental unhandled /api/search request.
    vi.mocked(useSearch).mockReturnValue({ isFetching: true } as ReturnType<
      typeof useSearch
    >);
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
  });

  it("should not show the loading state when the search is idle", () => {
    vi.mocked(useSearch).mockReturnValue({ isFetching: false } as ReturnType<
      typeof useSearch
    >);

    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    expect(
      screen.queryByRole("status", { name: /loading/i })
    ).not.toBeInTheDocument();
  });

  it("should clear debouncedQuery when input is cleared", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar placeholder="Search..." />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.clear(input);

    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("")
    );
  });
});
