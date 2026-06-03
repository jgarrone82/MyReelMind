import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchBar } from "./SearchBar";
import { useSearchFilters } from "@/stores/search-filters";
import * as useSearchModule from "@/hooks/queries/useSearch";
import { queryKeys } from "@/lib/query-keys";

// Build a wrapper that exposes its QueryClient so tests can seed real in-flight
// queries. The spinner is now driven by `useIsFetching` matching the ACTIVE
// search query key — there is no second `useSearch` to mock (issue #42 bug 1).
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return { Wrapper, queryClient };
}

/**
 * Seed a never-resolving query under `key` so the QueryClient reports it as
 * fetching. Never touches the network, so MSW's onUnhandledRequest:"error"
 * stays happy. Returns a resolver to let the query settle if needed.
 */
function seedInFlightQuery(queryClient: QueryClient, key: readonly unknown[]) {
  let resolve!: () => void;
  const gate = new Promise<{ results: never[]; totalPages: number }>((r) => {
    resolve = () => r({ results: [], totalPages: 0 });
  });
  void queryClient.fetchQuery({
    queryKey: key as unknown[],
    queryFn: () => gate,
  });
  return resolve;
}

describe("SearchBar", () => {
  beforeEach(() => {
    useSearchFilters.setState({
      query: "",
      debouncedQuery: "",
      type: "all",
      year: null,
      page: 1,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render search input only (type filter moved to chips)", () => {
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    expect(
      screen.getByRole("searchbox", { name: /search/i })
    ).toBeInTheDocument();
    // Type filter is now a separate TypeFilterChips component
    expect(screen.queryByRole("combobox", { name: /type/i })).not.toBeInTheDocument();
  });

  it("labels the search input exactly once, with no redundant ARIA", () => {
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

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
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: Wrapper,
    });

    expect(
      screen.queryByRole("button", { name: /clear search/i })
    ).not.toBeInTheDocument();
  });

  it("should render a CLEAR button when the query is non-empty", () => {
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });
    const { Wrapper } = createWrapper();

    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: Wrapper,
    });

    expect(
      screen.getByRole("button", { name: /clear search/i })
    ).toBeInTheDocument();
  });

  it("should clear the query in the store when CLEAR is clicked", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });
    const { Wrapper } = createWrapper();

    render(<SearchBar placeholder="Search..." clearLabel="CLEAR" />, {
      wrapper: Wrapper,
    });

    await user.click(screen.getByRole("button", { name: /clear search/i }));

    expect(useSearchFilters.getState().query).toBe("");
    // CLEAR must also reset debouncedQuery instantly (no debounce wait), so the
    // results view collapses immediately. Pins the setDebouncedQuery("") call.
    expect(useSearchFilters.getState().debouncedQuery).toBe("");
  });

  it("should update query in store when user types", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    expect(useSearchFilters.getState().query).toBe("naruto");
  });

  it("should debounce query update to debouncedQuery", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.type(input, "naruto");

    // Immediately, debouncedQuery should not be set
    expect(useSearchFilters.getState().debouncedQuery).toBe("");

    // After debounce timeout, it should be set
    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("naruto")
    );
  });

  // Bug #1 — the spinner must reflect the ACTIVE results query's fetching state
  // (the one SearchResults drives off the Zustand store), not a second query
  // under a divergent hardcoded key.
  it("shows the loading spinner when the ACTIVE search query is fetching", async () => {
    useSearchFilters.setState({
      query: "naruto",
      debouncedQuery: "naruto",
      type: "anime",
      year: 2002,
      page: 2,
    });
    const { Wrapper, queryClient } = createWrapper();

    // An in-flight query under the EXACT active key (query+type+year+page).
    const resolve = seedInFlightQuery(
      queryClient,
      queryKeys.search("naruto", "anime", 2002, 2)
    );

    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        screen.getByRole("status", { name: /loading/i })
      ).toBeInTheDocument()
    );

    resolve();
  });

  it("does NOT show the spinner for a query under a non-active key (no divergent query)", async () => {
    // Active filters are anime/2002/page 2 ...
    useSearchFilters.setState({
      query: "naruto",
      debouncedQuery: "naruto",
      type: "anime",
      year: 2002,
      page: 2,
    });
    const { Wrapper, queryClient } = createWrapper();

    // ... but an unrelated query under the OLD hardcoded key (all/page 1) is in
    // flight. The previous bug fired exactly this second query; the spinner
    // must NOT track it.
    const resolve = seedInFlightQuery(
      queryClient,
      queryKeys.search("naruto", "all", undefined, 1)
    );

    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    // Give effects a tick; the spinner must stay absent.
    await waitFor(() => {
      expect(useSearchFilters.getState().debouncedQuery).toBe("naruto");
    });
    expect(
      screen.queryByRole("status", { name: /loading/i })
    ).not.toBeInTheDocument();

    resolve();
  });

  it("should not show the loading state when nothing is fetching", () => {
    const { Wrapper } = createWrapper();
    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    expect(
      screen.queryByRole("status", { name: /loading/i })
    ).not.toBeInTheDocument();
  });

  it("does not fire its own useSearch query (spinner is read-only via useIsFetching)", () => {
    const useSearchSpy = vi.spyOn(useSearchModule, "useSearch");
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });
    const { Wrapper } = createWrapper();

    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    // The old bug called useSearch purely to read isFetching, firing a second
    // request against a divergent cache key. SearchBar must not do that.
    expect(useSearchSpy).not.toHaveBeenCalled();
  });

  it("should clear debouncedQuery when input is cleared", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ query: "naruto", debouncedQuery: "naruto" });
    const { Wrapper } = createWrapper();

    render(<SearchBar placeholder="Search..." />, { wrapper: Wrapper });

    const input = screen.getByRole("searchbox", { name: /search/i });
    await user.clear(input);

    await waitFor(() =>
      expect(useSearchFilters.getState().debouncedQuery).toBe("")
    );
  });
});
