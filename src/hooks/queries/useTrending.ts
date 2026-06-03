import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { TrendingResults } from "@/lib/search/service";

export function useTrending() {
  return useQuery<TrendingResults>({
    queryKey: queryKeys.trending(),
    queryFn: async () => {
      const res = await fetch("/api/trending");
      if (!res.ok) throw new Error("Trending fetch failed");
      return res.json();
    },
    // Trending is weekly/global — a 1h staleTime avoids refetch churn.
    staleTime: 1000 * 60 * 60,
  });
}
