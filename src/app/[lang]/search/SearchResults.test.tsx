import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchResults } from "./SearchResults";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

vi.mock("@/stores/search-filters");
vi.mock("@/hooks/queries/useSearch");
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
      typing: "READING TAPE…",
      zeroHead: "Out of stock",
      zeroSub: "Nothing on the shelf matches that title.",
      errorHead: "TERMINAL OFFLINE",
      errorBody:
        "The directory terminal lost its signal. Check the connection and search again.",
      errorRetry: "Retry search",
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

const mockResults = [
  {
    id: "tmdb-1",
    source: "tmdb",
    type: "movie",
    title: "Test Movie",
    originalTitle: null,
    year: 2023,
    description: null,
    score: null,
    popularity: null,
    coverImage: null,
    bannerImage: null,
    genres: [],
  },
];

describe("SearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      // poster-placeholder (no coverImage in the mock), so match all instances.
      expect(screen.getAllByText("Test Movie").length).toBeGreaterThan(0);
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
      expect(screen.getByText(/found 1 results for/i)).toBeInTheDocument();
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
});
