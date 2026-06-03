import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { TrendingResults } from "@/lib/search/service";

interface UseTrendingOptions {
  /**
   * Gate the network fetch. The hook is always called unconditionally (rules of
   * hooks); only the request is gated. Pass `false` when a search query is
   * active so trending never fetches behind an unused empty-query shelf.
   * Defaults to `true`.
   */
  enabled?: boolean;
}

export function useTrending({ enabled = true }: UseTrendingOptions = {}) {
  return useQuery<TrendingResults>({
    queryKey: queryKeys.trending(),
    queryFn: async () => {
      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("Trending fetch failed");
      return res.json();
    },
    // Trending is weekly/global — a 1h staleTime avoids refetch churn.
    staleTime: 1000 * 60 * 60,
    enabled,
  });
}
