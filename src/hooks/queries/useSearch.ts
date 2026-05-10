import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { MediaItem } from "@/lib/api/merge";

export function useSearch(query: string, type: string, year?: number | null, page: number = 1) {
  return useQuery<MediaItem[]>({
    queryKey: queryKeys.search(query, type, year, page),
    queryFn: async () => {
      if (!query.trim()) return [];

      const params = new URLSearchParams({ q: query, type, page: String(page) });
      if (year) params.set("year", String(year));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      return data.results as MediaItem[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
