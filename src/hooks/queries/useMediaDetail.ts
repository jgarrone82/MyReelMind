import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { MediaItem } from "@/lib/api/merge";

export function useMediaDetail(id: string) {
  return useQuery<MediaItem | null>({
    queryKey: queryKeys.mediaDetail(id),
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/media/${id}`);
      if (!res.ok) throw new Error("Failed to fetch media details");
      return res.json() as Promise<MediaItem>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
