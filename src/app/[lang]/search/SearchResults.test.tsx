import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SearchResults } from "./SearchResults";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

vi.mock("@/stores/search-filters");
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

  it("should render empty state when no query", () => {
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
    vi.mocked(useSearch).mockReturnValue({ data: [] as any, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
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
    vi.mocked(useSearch).mockReturnValue({ data: mockResults as any, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });
  });

  it("should show Load More button when there are results and more pages available", async () => {
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
    vi.mocked(useSearch)
      .mockReturnValueOnce({ data: mockResults as any, isLoading: false } as any)
      .mockReturnValueOnce({ data: mockResults as any, isLoading: false } as any);

    render(<SearchResults lang="es" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });
  });
});
