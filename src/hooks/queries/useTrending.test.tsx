import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTrending } from "./useTrending";
import { queryKeys } from "@/lib/query-keys";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
}

describe("queryKeys.trending", () => {
  it("returns a stable [\"trending\"] key", () => {
    expect(queryKeys.trending()).toEqual(["trending"]);
  });
});

describe("useTrending", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is loading while the trending fetch is in flight", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}) as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("exposes the returned trending items on success", async () => {
    const results = [{ id: "tmdb-1", source: "tmdb", title: "Trending" }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toEqual(results);
  });

  it("exposes an empty results array when trending returns nothing", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toEqual([]);
  });

  it("uses a 1h staleTime", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as never);
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = queryClient.getQueryCache().find({ queryKey: queryKeys.trending() });
    expect(query?.observers[0]?.options.staleTime).toBe(1000 * 60 * 60);
  });
});
