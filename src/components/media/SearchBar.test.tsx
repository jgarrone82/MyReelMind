import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchBar } from "./SearchBar";
import { useSearchFilters } from "@/stores/search-filters";

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
    useSearchFilters.setState({
      query: "",
      debouncedQuery: "",
      type: "all",
      year: null,
    });
  });

  it("should render search input and type filter", () => {
    render(<SearchBar />, { wrapper: createWrapper() });

    expect(
      screen.getByRole("searchbox", { name: /search/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /type/i })).toBeInTheDocument();
  });

  it("should update query in store when user types", async () => {
    const user = userEvent.setup();
    render(<SearchBar />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    expect(useSearchFilters.getState().query).toBe("naruto");
  });

  it("should debounce query update to debouncedQuery", async () => {
    const user = userEvent.setup();
    render(<SearchBar />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    // Immediately, debouncedQuery should not be set
    expect(useSearchFilters.getState().debouncedQuery).toBe("");

    // After debounce timeout, it should be set
    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("naruto")
    );
  });

  it("should update type filter in store when changed", async () => {
    const user = userEvent.setup();
    render(<SearchBar />, { wrapper: createWrapper() });

    const select = screen.getByRole("combobox", { name: /type/i });
    await user.selectOptions(select, "anime");

    expect(useSearchFilters.getState().type).toBe("anime");
  });

  it("should show loading state when search is fetching", () => {
    // Pre-set a query so useSearch will attempt to fetch
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar />, { wrapper: createWrapper() });

    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
  });

  it("should clear debouncedQuery when input is cleared", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });

    render(<SearchBar />, { wrapper: createWrapper() });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.clear(input);

    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("")
    );
  });
});
