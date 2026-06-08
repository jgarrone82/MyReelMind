import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useLibraryState } from "./useLibraryState";
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

const userId = "user-1";

describe("useLibraryState", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does NOT fetch when logged out (userId is null) and returns an empty Map", () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState(["tmdb-1"], null), {
      wrapper: Wrapper,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);
  });

  it("does NOT fetch when there are no ids and returns an empty Map", () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState([], userId), {
      wrapper: Wrapper,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);
  });

  it("POSTs the ids to /api/library-state and returns the states as a Map", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        states: { "tmdb-1": "in_library", "anilist-21": "in_progress" },
      }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(
      () => useLibraryState(["tmdb-1", "anilist-21", "tmdb-99"], userId),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.data.size).toBe(2));

    expect(fetch).toHaveBeenCalledWith(
      "/api/library-state",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ ids: ["tmdb-1", "anilist-21", "tmdb-99"] }),
      })
    );
    expect(result.current.data.get("tmdb-1")).toBe("in_library");
    expect(result.current.data.get("anilist-21")).toBe("in_progress");
    // An untracked id is simply absent from the Map (caller defaults to ADD).
    expect(result.current.data.has("tmdb-99")).toBe(false);
  });

  it("is NOT successful while the fetch is in flight, and exposes an empty Map during the pending window", async () => {
    // A deferred promise lets us hold the query in `pending` so we can assert the
    // in-flight contract before resolving. Regression guard: with `placeholderData`
    // set, React Query v5 reports `status === "success"` while still pending, which
    // would feed an EMPTY Map to the SearchResults badge gate and flash ADD on every
    // card. The hook must keep `isSuccess === false` until a real response arrives.
    let resolveFetch!: (value: {
      ok: boolean;
      json: () => Promise<{ states: Record<string, string> }>;
    }) => void;
    const fetchPromise = new Promise<{
      ok: boolean;
      json: () => Promise<{ states: Record<string, string> }>;
    }>((resolve) => {
      resolveFetch = resolve;
    });
    vi.mocked(fetch).mockReturnValue(fetchPromise as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState(["tmdb-1"], userId), {
      wrapper: Wrapper,
    });

    // In flight: still pending, NOT success, and the data is the stable empty Map.
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);

    // Resolve with real states → now success, and the Map reflects the response.
    resolveFetch({
      ok: true,
      json: async () => ({ states: { "tmdb-1": "in_library" } }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.size).toBe(1);
    expect(result.current.data.get("tmdb-1")).toBe("in_library");
  });

  it("returns an empty Map when the server reports no tracked states", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ states: {} }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState(["tmdb-1"], userId), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);
  });

  it("returns an empty Map (never throws) when the fetch rejects", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState(["tmdb-1"], userId), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // The consumer must ALWAYS read a Map — error never propagates as undefined.
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);
  });

  it("returns an empty Map (never throws) on a non-ok HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as never);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useLibraryState(["tmdb-1"], userId), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data.size).toBe(0);
  });

  it("keys the cache via queryKeys.libraryState(userId, ids)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ states: {} }),
    } as never);
    const { Wrapper, queryClient } = createWrapper();

    renderHook(() => useLibraryState(["tmdb-2", "tmdb-1"], userId), {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(
        queryClient
          .getQueryCache()
          .find({ queryKey: queryKeys.libraryState(userId, ["tmdb-2", "tmdb-1"]) })
      ).toBeTruthy()
    );
  });

  it("keeps the returned data referentially stable across re-renders (success path)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ states: { "tmdb-1": "in_library" } }),
    } as never);
    const { Wrapper } = createWrapper();

    const { result, rerender } = renderHook(
      () => useLibraryState(["tmdb-1"], userId),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.data.size).toBe(1));

    const first = result.current.data;
    rerender();
    // Same inputs → same Map identity, so downstream memoization holds.
    expect(result.current.data).toBe(first);
  });

  it("uses a 5m staleTime", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ states: {} }),
    } as never);
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(
      () => useLibraryState(["tmdb-1"], userId),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = queryClient
      .getQueryCache()
      .find({ queryKey: queryKeys.libraryState(userId, ["tmdb-1"]) });
    expect(query?.observers[0]?.options.staleTime).toBe(1000 * 60 * 5);
  });
});
