import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchResults } from "./SearchResults";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { useTrending } from "@/hooks/queries/useTrending";
import { useLibraryState } from "@/hooks/queries/useLibraryState";
import { useAuthUserId } from "@/hooks/useAuthUserId";
import type { LibraryBadgeState } from "@/lib/dashboard/library-state";

vi.mock("@/stores/search-filters");
vi.mock("@/hooks/queries/useSearch");
vi.mock("@/hooks/queries/useTrending");
vi.mock("@/hooks/queries/useLibraryState");
vi.mock("@/hooks/useAuthUserId");
vi.mock("@/i18n/provider", () => ({
  useDictionary: () => ({
    search: {
      loadMore: "Load More",
      loadingMore: "Loading...",
      noResults: "No results found",
      tryAdjusting: "Try adjusting your search or filters",
      searchPrompt: "Search for movies or anime",
      searchPromptHint: "Find something to add to your library",
      resultsSub: "SORTED BY RELEVANCE · TERMINAL 04",
      resultsHead: "Found {n} results for",
      resultsHeadOne: "Found {n} result for",
      typing: "READING TAPE…",
      zeroHead: "Out of stock",
      zeroSub: "Nothing on the shelf matches that title.",
      errorHead: "TERMINAL OFFLINE",
      errorBody:
        "The directory terminal lost its signal. Check the connection and search again.",
      errorRetry: "Retry search",
      nowShowingHead: "Now showing — popular this week",
      badge: {
        add: "ADD",
        inLibrary: "IN LIBRARY",
        inProgress: "IN PROGRESS",
      },
    },
  }),
}));

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

function makeItem(id: string, title: string) {
  return {
    id,
    source: "tmdb",
    type: "movie",
    title,
    originalTitle: null,
    year: 2023,
    description: null,
    score: null,
    popularity: null,
    coverImage: null,
    bannerImage: null,
    genres: [],
  };
}

const mockResults = [makeItem("tmdb-1", "Test Movie")];

function baseFilters(overrides: Record<string, unknown> = {}) {
  return {
    query: "test",
    debouncedQuery: "test",
    type: "all" as const,
    year: null,
    page: 1,
    setQuery: vi.fn(),
    setDebouncedQuery: vi.fn(),
    setType: vi.fn(),
    setYear: vi.fn(),
    setPage: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

/**
 * Build the `useLibraryState` mock return — a Map plus the UseQueryResult
 * surface the consumer reads. Defaults to an EMPTY Map so the baseline tests
 * (logged-out, no badge) are unaffected by the badge wiring.
 */
function mockLibraryState(entries: Record<string, LibraryBadgeState> = {}) {
  const map = new Map<string, LibraryBadgeState>(Object.entries(entries));
  vi.mocked(useLibraryState).mockReturnValue({
    data: map,
    isSuccess: true,
    isError: false,
    isLoading: false,
  } as any);
  return map;
}

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: trending degrades to the empty/honest-prompt path. Cases that
    // exercise the empty-query branch override this per test.
    vi.mocked(useTrending).mockReturnValue({
      data: { results: [] },
      isLoading: false,
    } as any);
    // Default: logged out → no userId, empty library-state Map → no badges.
    // This keeps every pre-existing test byte-for-byte identical in behavior.
    vi.mocked(useAuthUserId).mockReturnValue(null);
    mockLibraryState();
  });

  it("should render the initial search prompt when no query (not the no-results message)", () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "",
      debouncedQuery: "",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: [], totalPages: 0 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(screen.getByText(/search for movies or anime/i)).toBeInTheDocument();
    expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
  });

  it("should render the no-results message when a query is present but returns nothing", () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "zxqw",
      debouncedQuery: "zxqw",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: [], totalPages: 0 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    // Restyled no-results panel ("Out of stock") — semantically distinct from
    // the empty-query prompt, which must NOT appear here.
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(screen.queryByText(/search for movies or anime/i)).not.toBeInTheDocument();
  });

  it("should render search results when query exists", async () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "test",
      debouncedQuery: "test",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: mockResults, totalPages: 5 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      // VHSBoxCard renders the title in both the card header strip and the
      // poster-placeholder (no coverImage in the mock), so exactly 2 instances.
      expect(screen.getAllByText("Test Movie")).toHaveLength(2);
    });
  });

  it("should show Load More button when page < totalPages", async () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "test",
      debouncedQuery: "test",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: mockResults, totalPages: 5 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });
  });

  it("should call setPage when Load More button is clicked", async () => {
    const mockSetPage = vi.fn();
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "test",
      debouncedQuery: "test",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: mockSetPage,
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: mockResults, totalPages: 5 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });

    screen.getByText("Load More").click();
    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("should hide Load More button when on last page", async () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "test",
      debouncedQuery: "test",
      type: "all" as const,
      year: null,
      page: 5,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: mockResults, totalPages: 5 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText("Load More")).not.toBeInTheDocument();
    });
  });

  it("should render a receipt-style 'Found N results' header with the real count", async () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "alien",
      debouncedQuery: "alien",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: mockResults, totalPages: 5 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      // N is the real accumulated count (1 mock result), not a fabricated number.
      // Singular grammar applies for exactly one result.
      expect(screen.getByText(/found 1 result for/i)).toBeInTheDocument();
      expect(screen.getByText(/alien/i)).toBeInTheDocument();
    });
  });

  it("should render the out-of-stock panel (distinct from the empty-query prompt) when a query returns nothing", () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "zxqw",
      debouncedQuery: "zxqw",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({ data: { results: [], totalPages: 0 }, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(
      screen.getByText(/nothing on the shelf matches that title/i)
    ).toBeInTheDocument();
    // Still NOT the empty-query prompt.
    expect(
      screen.queryByText(/search for movies or anime/i)
    ).not.toBeInTheDocument();
  });

  it("should surface the terminal-offline error panel when the search errors", () => {
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "alien",
      debouncedQuery: "alien",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(screen.getByText(/terminal offline/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry search/i })
    ).toBeInTheDocument();
  });

  it("should call refetch when the RETRY button is clicked", async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useSearchFilters).mockReturnValue({
      query: "alien",
      debouncedQuery: "alien",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    });
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    screen.getByRole("button", { name: /retry search/i }).click();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("keeps results on screen with an inline retry when a Load More fails (isError with results)", async () => {
    // Models the REAL Load More flow:
    //   1. A successful page-1 request populates the on-screen grid (allResults
    //      fills via the append effect).
    //   2. The user hits Load More → page becomes 2 → that request FAILS, so
    //      React Query returns `data: undefined` + `isError: true` for the
    //      fresh failed page.
    // The accumulated page-1 cards must survive (not be wiped by the error),
    // and the inline retry — not the full-screen panel — must surface.
    const page1Filters = {
      query: "test",
      debouncedQuery: "test",
      type: "all" as const,
      year: null,
      page: 1,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
      setYear: vi.fn(),
      setPage: vi.fn(),
      reset: vi.fn(),
    };
    vi.mocked(useSearchFilters).mockReturnValue(page1Filters);
    vi.mocked(useSearch).mockReturnValue({
      data: { results: mockResults, totalPages: 5 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { rerender } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    // Page-1 results are populated on screen via the append effect.
    await waitFor(() => {
      expect(screen.getAllByText("Test Movie")).toHaveLength(2);
    });

    // User hits Load More → page advances to 2 and that request fails.
    vi.mocked(useSearchFilters).mockReturnValue({
      ...page1Filters,
      page: 2,
    });
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    rerender(<SearchResults lang="es" />);

    // The accumulated page-1 card is STILL rendered (NOT replaced by the
    // full-screen error panel).
    expect(screen.getAllByText("Test Movie")).toHaveLength(2);
    // The full-screen TERMINAL OFFLINE header must NOT appear.
    expect(screen.queryByText(/terminal offline/i)).not.toBeInTheDocument();
    // A non-destructive inline retry is present.
    expect(
      screen.getByRole("button", { name: /retry search/i })
    ).toBeInTheDocument();
    // No double-button: the Load More button must NOT co-exist with the
    // inline retry while the request is in an error state.
    expect(screen.queryByText("Load More")).not.toBeInTheDocument();
  });

  // Bug #2 — stale `totalPages` during an in-flight revalidation must not flip
  // the Load More button. React Query (staleTime 5m, no placeholderData) can
  // hand back a CACHED page whose `totalPages` is stale while a background
  // refetch runs (`isFetching: true`). The button must reflect the SETTLED
  // query, not the transitional/stale totalPages.
  it("does not flip Load More on stale totalPages while the query is revalidating", async () => {
    // Page 1 settled: 5 total pages → button visible.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: mockResults, totalPages: 5 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { rerender } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });

    // Revalidation in flight: the hook still returns the CACHED data but with a
    // STALE totalPages of 1 (an earlier response said 1 page). The fresh server
    // response — not yet settled — will say 5. During this in-flight window the
    // naive `page < data.totalPages` reads `1 < 1` → false and WRONGLY hides the
    // button. The settled-data guard must suppress the flip while fetching.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: mockResults, totalPages: 1 },
      isLoading: false,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    rerender(<SearchResults lang="es" />);

    // The button must NOT disappear mid-revalidation on a stale totalPages.
    expect(screen.getByText("Load More")).toBeInTheDocument();

    // Revalidation settles with the correct totalPages of 5 → button stays.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: mockResults, totalPages: 5 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getByText("Load More")).toBeInTheDocument();
    });
  });

  // Bug #3 — slot idempotency. With per-page React Query keys
  // (['search', q, type, year, page]) the component only ever observes the
  // CURRENT page's `data`, so a true network reorder is not observable here.
  // What this verifies is that re-delivering page-1's slot — via a store-driven
  // `page` reset back to 1 after later pages have already accumulated — does
  // NOT clobber the page-2 slot. Each settled page lands in its own slot keyed
  // by page index, so re-writing slot 1 overwrites only slot 1 and leaves slot
  // 2 intact (both pages present, in page order, no duplicates, none lost). The
  // naive "page === 1 → replace" effect corrupts this (page-1 wipes page-2's
  // items).
  it("keeps results order-safe when page-1's slot is re-delivered after page-2 (slot idempotency)", async () => {
    const page1 = [makeItem("tmdb-1", "Alpha"), makeItem("tmdb-2", "Bravo")];
    const page2 = [makeItem("tmdb-3", "Charlie"), makeItem("tmdb-4", "Delta")];

    // Step 1: page 1 issued. Its response is SLOW — not settled yet.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { rerender } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    // Step 2: page 1 settles → its items populate slot 1.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: page1, totalPages: 5 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    });

    // Step 3: user hits Load More → page 2 settles and APPENDS.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 2 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: page2, totalPages: 5 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getAllByText("Charlie").length).toBeGreaterThan(0);
    });

    // Step 4: SLOT IDEMPOTENCY. The store-driven `page` resets back to 1 after
    // page 2 already landed (e.g. a Load More / pagination control returning to
    // the first page), so the component observes page-1's `data` again and
    // re-writes slot 1. With the naive effect this would REPLACE the whole list
    // with only page-1 items, losing page 2. The slot-keyed accumulation must
    // overwrite only slot 1 and keep BOTH pages intact.
    vi.mocked(useSearchFilters).mockReturnValue(baseFilters({ page: 1 }));
    vi.mocked(useSearch).mockReturnValue({
      data: { results: page1, totalPages: 5 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    // All four items survive, in page order, with no duplicates.
    await waitFor(() => {
      expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    });
    for (const title of ["Alpha", "Bravo", "Charlie", "Delta"]) {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    }
    // The header count reflects exactly 4 unique accumulated results.
    expect(screen.getByText(/found 4 results for/i)).toBeInTheDocument();
  });

  // Bug #3 (companion) — a NEW query must reset accumulation so stale pages
  // from the previous query never bleed into the new result set.
  it("resets accumulation when the query changes (no cross-query bleed)", async () => {
    const queryAResults = [makeItem("a-1", "Alien"), makeItem("a-2", "Aliens")];
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({ query: "alien", debouncedQuery: "alien", page: 1 })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: queryAResults, totalPages: 2 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { rerender } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getAllByText("Alien").length).toBeGreaterThan(0);
    });

    // Switch to a brand-new query → page resets to 1, fresh results.
    const queryBResults = [makeItem("b-1", "Matrix")];
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({ query: "matrix", debouncedQuery: "matrix", page: 1 })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: queryBResults, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getAllByText("Matrix").length).toBeGreaterThan(0);
    });
    // The previous query's items must be gone, count reflects only query B.
    expect(screen.queryByText("Alien")).not.toBeInTheDocument();
    expect(screen.getByText(/found 1 result for/i)).toBeInTheDocument();
  });

  // Bug #3 (companion) — changing a FILTER (type/year) with the SAME query must
  // also reset accumulation. The query-identity key is
  // `debouncedQuery::type::year`, so a filter change is a distinct result set.
  //
  // Fail-first design: the previous filter accumulates page 1 AND page 2, then
  // the user switches type and lands back on page 1. The old code keyed its
  // reset on `debouncedQuery` only, so with the query held constant it would
  // NOT reset — slot 1 gets overwritten by the new type's page 1, but slot 2
  // from the previous type SURVIVES and bleeds into the new filter's grid.
  // The widened identity key clears the whole accumulation map, so slot 2 is
  // gone and only the new type's results remain.
  it("resets accumulation when only the type filter changes (no cross-filter bleed)", async () => {
    // "all" filter, page 1.
    const allPage1 = [makeItem("all-1", "Naruto Movie")];
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({
        query: "naruto",
        debouncedQuery: "naruto",
        type: "all" as const,
        page: 1,
      })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: allPage1, totalPages: 3 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { rerender } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getAllByText("Naruto Movie").length).toBeGreaterThan(0);
    });

    // "all" filter, Load More → page 2 accumulates into slot 2.
    const allPage2 = [makeItem("all-2", "Naruto Live Action")];
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({
        query: "naruto",
        debouncedQuery: "naruto",
        type: "all" as const,
        page: 2,
      })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: allPage2, totalPages: 3 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getAllByText("Naruto Live Action").length).toBeGreaterThan(0);
    });

    // Same query, but the user narrows the type filter to "anime" and lands
    // back on page 1. The result-set identity changes → accumulation must
    // reset. The new page-1 results overwrite slot 1; without the reset, slot 2
    // ("Naruto Live Action") from the previous filter would survive and bleed.
    const animePage1 = [makeItem("anime-1", "Naruto Shippuden")];
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({
        query: "naruto",
        debouncedQuery: "naruto",
        type: "anime" as const,
        page: 1,
      })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: animePage1, totalPages: 1 },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
    rerender(<SearchResults lang="es" />);

    await waitFor(() => {
      expect(screen.getAllByText("Naruto Shippuden").length).toBeGreaterThan(0);
    });
    // The previous type's accumulated pages must be gone (no cross-filter
    // bleed), and the count reflects only the new type's result set.
    expect(screen.queryByText("Naruto Movie")).not.toBeInTheDocument();
    expect(screen.queryByText("Naruto Live Action")).not.toBeInTheDocument();
    expect(screen.getByText(/found 1 result for/i)).toBeInTheDocument();
  });

  // Trending NOW SHOWING shelf (empty-query state) — change `search-trending`.

  function emptyQueryFilters() {
    return baseFilters({ query: "", debouncedQuery: "" });
  }

  it("shows the TapeSkeleton while trending is loading (empty query)", () => {
    vi.mocked(useSearchFilters).mockReturnValue(emptyQueryFilters());
    vi.mocked(useSearch).mockReturnValue({
      data: { results: [], totalPages: 0 },
      isLoading: false,
    } as any);
    vi.mocked(useTrending).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { container } = render(<SearchResults lang="es" />, {
      wrapper: createWrapper(),
    });

    // TapeSkeleton uses aria-hidden placeholder tiles; assert it rendered and
    // neither the trending grid nor the honest prompt is shown yet.
    expect(container.querySelector(".tape-skeleton")).toBeInTheDocument();
    expect(
      screen.queryByText(/now showing — popular this week/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/search for movies or anime/i)
    ).not.toBeInTheDocument();
  });

  it("renders the trending grid under the NOW SHOWING heading on success (empty query)", () => {
    vi.mocked(useSearchFilters).mockReturnValue(emptyQueryFilters());
    vi.mocked(useSearch).mockReturnValue({
      data: { results: [], totalPages: 0 },
      isLoading: false,
    } as any);
    vi.mocked(useTrending).mockReturnValue({
      data: {
        results: [makeItem("tmdb-1", "Trending One"), makeItem("anilist-2", "Trending Two")],
      },
      isLoading: false,
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/now showing — popular this week/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("Trending One").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trending Two").length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/search for movies or anime/i)
    ).not.toBeInTheDocument();
  });

  it("degrades to the honest prompt when trending returns nothing (empty query)", () => {
    vi.mocked(useSearchFilters).mockReturnValue(emptyQueryFilters());
    vi.mocked(useSearch).mockReturnValue({
      data: { results: [], totalPages: 0 },
      isLoading: false,
    } as any);
    vi.mocked(useTrending).mockReturnValue({
      data: { results: [] },
      isLoading: false,
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/search for movies or anime/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/now showing — popular this week/i)
    ).not.toBeInTheDocument();
  });

  it("degrades to the honest prompt when trending errors with undefined data (empty query)", () => {
    // Guards the `trendingData?.results ?? []` optional-chain degradation: a
    // genuine trending HTTP failure leaves `data` undefined and `isError` true.
    // The empty-query branch must fall back to the honest prompt — no crash, no
    // empty grid, no NOW SHOWING heading.
    vi.mocked(useSearchFilters).mockReturnValue(emptyQueryFilters());
    vi.mocked(useSearch).mockReturnValue({
      data: { results: [], totalPages: 0 },
      isLoading: false,
    } as any);
    vi.mocked(useTrending).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/search for movies or anime/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/now showing — popular this week/i)
    ).not.toBeInTheDocument();
  });

  it("does NOT show the trending heading when a query is active (no regression)", () => {
    vi.mocked(useSearchFilters).mockReturnValue(
      baseFilters({ query: "naruto", debouncedQuery: "naruto" })
    );
    vi.mocked(useSearch).mockReturnValue({
      data: { results: mockResults, totalPages: 1 },
      isLoading: false,
    } as any);
    // Even if trending happens to have data, it must not surface on an active
    // query.
    vi.mocked(useTrending).mockReturnValue({
      data: { results: [makeItem("tmdb-9", "Should Not Show")] },
      isLoading: false,
    } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(
      screen.queryByText(/now showing — popular this week/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Should Not Show")).not.toBeInTheDocument();
  });

  // ── Library-state badges on search results (#42 Group D, PR-D3) ─────────────
  // The shelf enriches each result with its per-user library-state badge via a
  // SINGLE useLibraryState call over all result ids. Honest-data: logged-out →
  // empty Map → no badges (identical to pre-change behavior). Badge label comes
  // from i18n; color is the design's state→hue map (D4):
  //   in_library → phosphor, in_progress → sodium, add → magenta.
  describe("library-state badges", () => {
    function loggedInQuery(results = mockResults) {
      vi.mocked(useAuthUserId).mockReturnValue("user-1");
      vi.mocked(useSearchFilters).mockReturnValue(
        baseFilters({ query: "alien", debouncedQuery: "alien", page: 1 })
      );
      vi.mocked(useSearch).mockReturnValue({
        data: { results, totalPages: 1 },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);
    }

    /** The GenreSticker badge for a given label, or null if absent. */
    function badgeFor(label: string): HTMLElement | null {
      return screen
        .queryAllByText(label)
        .find((el) => el.className.includes("vhs-kicker")) ?? null;
    }

    it("renders NO badge when logged out (empty library-state Map)", async () => {
      // Default beforeEach: userId null, empty Map.
      vi.mocked(useSearchFilters).mockReturnValue(
        baseFilters({ query: "alien", debouncedQuery: "alien", page: 1 })
      );
      vi.mocked(useSearch).mockReturnValue({
        data: { results: mockResults, totalPages: 1 },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText("Test Movie").length).toBeGreaterThan(0);
      });
      expect(badgeFor("ADD")).toBeNull();
      expect(badgeFor("IN LIBRARY")).toBeNull();
      expect(badgeFor("IN PROGRESS")).toBeNull();
    });

    it("renders an IN LIBRARY phosphor badge for an in_library result", async () => {
      loggedInQuery();
      mockLibraryState({ "tmdb-1": "in_library" });

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const badge = badgeFor("IN LIBRARY");
        expect(badge).not.toBeNull();
        expect(badge?.className).toContain("var(--vhs-phosphor)");
      });
    });

    it("renders an IN PROGRESS sodium badge for an in_progress result", async () => {
      loggedInQuery();
      mockLibraryState({ "tmdb-1": "in_progress" });

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const badge = badgeFor("IN PROGRESS");
        expect(badge).not.toBeNull();
        expect(badge?.className).toContain("var(--vhs-sodium)");
      });
    });

    it("renders an ADD magenta badge for an untracked result when logged in", async () => {
      // Logged in but this id is NOT in the Map → ADD (the logged-in affordance).
      loggedInQuery();
      mockLibraryState({});

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        const badge = badgeFor("ADD");
        expect(badge).not.toBeNull();
        expect(badge?.className).toContain("var(--vhs-magenta)");
      });
    });

    it("calls useLibraryState ONCE with all result ids and the userId", async () => {
      const results = [
        makeItem("tmdb-1", "One"),
        makeItem("anilist-2", "Two"),
        makeItem("tmdb-3", "Three"),
      ];
      loggedInQuery(results);
      mockLibraryState({});

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText("One").length).toBeGreaterThan(0);
      });
      // A single shelf-level call (not one per card) over the full id list.
      expect(useLibraryState).toHaveBeenCalledWith(
        ["tmdb-1", "anilist-2", "tmdb-3"],
        "user-1"
      );
    });

    it("passes an empty id list (no fetch) when there are zero results", () => {
      vi.mocked(useAuthUserId).mockReturnValue("user-1");
      vi.mocked(useSearchFilters).mockReturnValue(
        baseFilters({ query: "zxqw", debouncedQuery: "zxqw", page: 1 })
      );
      vi.mocked(useSearch).mockReturnValue({
        data: { results: [], totalPages: 0 },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);
      mockLibraryState({});

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      // The hook is still CALLED (rules of hooks) but with no ids, so it no-ops
      // (enabled-gating in the hook prevents any fetch).
      expect(useLibraryState).toHaveBeenCalledWith([], "user-1");
    });

    // Integration smoke (T26): a logged-in page with MIXED states renders the
    // correct per-result badge for each; logged-out renders none.
    it("renders correct mixed-state badges across a logged-in result page", async () => {
      const results = [
        makeItem("tmdb-1", "Owned"),
        makeItem("tmdb-2", "Active"),
        makeItem("tmdb-3", "Untracked"),
      ];
      loggedInQuery(results);
      mockLibraryState({
        "tmdb-1": "in_library",
        "tmdb-2": "in_progress",
        // tmdb-3 absent → ADD
      });

      render(<SearchResults lang="en" />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(badgeFor("IN LIBRARY")).not.toBeNull();
      });
      expect(badgeFor("IN LIBRARY")?.className).toContain("var(--vhs-phosphor)");
      expect(badgeFor("IN PROGRESS")?.className).toContain("var(--vhs-sodium)");
      expect(badgeFor("ADD")?.className).toContain("var(--vhs-magenta)");
    });

    // T17: Load More append — newly accumulated results each get their correct
    // per-result badge. The shelf enriches over the FULL accumulated id list, so
    // a second page's ids resolve their own state on the same single hook call.
    it("enriches newly appended Load More results with their own badges", async () => {
      const page1 = [makeItem("tmdb-1", "Owned")];
      const page2 = [makeItem("tmdb-2", "Active")];
      vi.mocked(useAuthUserId).mockReturnValue("user-1");

      // Page 1 settles: tmdb-1 → in_library.
      vi.mocked(useSearchFilters).mockReturnValue(
        baseFilters({ query: "alien", debouncedQuery: "alien", page: 1 })
      );
      vi.mocked(useSearch).mockReturnValue({
        data: { results: page1, totalPages: 5 },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);
      mockLibraryState({ "tmdb-1": "in_library" });

      const { rerender } = render(<SearchResults lang="en" />, {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(badgeFor("IN LIBRARY")).not.toBeNull();
      });

      // Load More → page 2 appends tmdb-2; the Map now covers BOTH ids.
      vi.mocked(useSearchFilters).mockReturnValue(
        baseFilters({ query: "alien", debouncedQuery: "alien", page: 2 })
      );
      vi.mocked(useSearch).mockReturnValue({
        data: { results: page2, totalPages: 5 },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);
      mockLibraryState({ "tmdb-1": "in_library", "tmdb-2": "in_progress" });

      rerender(<SearchResults lang="en" />);

      await waitFor(() => {
        expect(badgeFor("IN PROGRESS")).not.toBeNull();
      });
      // Both accumulated pages keep their correct badges.
      expect(badgeFor("IN LIBRARY")).not.toBeNull();
      // The hook saw the full accumulated id set on the latest render.
      expect(useLibraryState).toHaveBeenLastCalledWith(
        ["tmdb-1", "tmdb-2"],
        "user-1"
      );
    });
  });
});
