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

    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
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
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
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
});
