import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { SearchResults } from "./SearchResults";
import { server } from "../../../../tests/mocks/server";
import { useSearchFilters } from "@/stores/search-filters";

vi.mock("@/stores/search-filters");
vi.mock("@/hooks/queries/useSearch");

const mockUseSearchFilters = useSearchFilters as ReturnType<typeof vi.fn>;
const mockUseSearch = require("@/hooks/queries/useSearch").useSearch as ReturnType<typeof vi.fn>;

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
    mockUseSearchFilters.mockReturnValue({
      query: "",
      debouncedQuery: "",
      type: "all",
      year: null,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
    });
    mockUseSearch.mockReturnValue({ data: [], isLoading: false });
  });

  it("should render empty state when no query", () => {
    render(<SearchResults />, { wrapper: createWrapper() });

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("should render search results when query exists", async () => {
    mockUseSearchFilters.mockReturnValue({
      query: "test",
      debouncedQuery: "test",
      type: "all",
      year: null,
      setQuery: vi.fn(),
      setDebouncedQuery: vi.fn(),
      setType: vi.fn(),
    });
    mockUseSearch.mockReturnValue({ data: mockResults, isLoading: false });

    render(<SearchResults />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });
  });
});
