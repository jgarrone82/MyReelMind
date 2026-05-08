import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import SearchPage from "./page";
import { server } from "../../../../tests/mocks/server";

const mockSetState = vi.fn();
vi.mock("@/stores/search-filters", () => ({
  useSearchFilters: vi.fn(() => ({
    query: "",
    debouncedQuery: "",
    type: "all",
    year: null,
    setQuery: vi.fn(),
    setDebouncedQuery: vi.fn(),
    setType: vi.fn(),
  })),
}));

const { useSearchFilters } = require("@/stores/search-filters");

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

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetState.mockClear();
  });

  it("should render search bar", () => {
    render(<SearchPage params={Promise.resolve({ lang: "es" })} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByRole("searchbox", { name: /search/i })
    ).toBeInTheDocument();
  });

  it("should show empty state when no query", () => {
    render(<SearchPage params={Promise.resolve({ lang: "es" })} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("should render search results when query exists", async () => {
    server.use(
      http.get("/api/search", () => {
        return HttpResponse.json({ results: mockResults });
      })
    );

    render(<SearchPage params={Promise.resolve({ lang: "es" })} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText("Test Movie")).toBeInTheDocument();
    });
  });
});
