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

  it("ends in isError with undefined data on a genuine HTTP failure", async () => {
    // Distinct from the route's honest 200: a real network/HTTP failure (the
    // route should never emit this, but a proxy/CDN/timeout can). Guards the
    // defensive `if (!res.ok) throw` path so the hook surfaces an error state
    // instead of returning a non-ok body as if it were data.
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
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

  it("does NOT fetch when disabled (a query is active)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending({ enabled: false }), {
      wrapper: Wrapper,
    });

    // The query stays idle: no fetch is issued and React Query reports the
    // disabled (pending + not fetching) state rather than loading.
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isLoading).toBe(false);
  });

  it("fetches when explicitly enabled (no active query)", async () => {
    const results = [{ id: "tmdb-1", source: "tmdb", title: "Trending" }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending({ enabled: true }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/trending");
    expect(result.current.data?.results).toEqual(results);
  });

  it("fetches by default when no options are passed", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useTrending(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetch).toHaveBeenCalledWith("/api/trending");
  });
});
