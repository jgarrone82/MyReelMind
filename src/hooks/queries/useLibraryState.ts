import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { LibraryBadgeState } from "@/lib/dashboard/library-state";

interface LibraryStateResponse {
  states: Record<string, LibraryBadgeState>;
}

const EMPTY_STATE: LibraryStateResponse = { states: {} };

export type LibraryStateMap = Map<string, LibraryBadgeState>;

/**
 * Enrich a page of search results with their per-user library-state badge.
 *
 * Cosmetic, non-blocking, and resilient by contract:
 * - `enabled` only when there is a `userId` AND at least one id, so a logged-out
 *   user or an empty results page NEVER issues a request.
 * - the consumer ALWAYS reads a `Map` — `placeholderData` seeds an empty Map
 *   before the first response and after an error, so a failed/slow lookup
 *   degrades silently (badges drop) instead of throwing or yielding `undefined`.
 *
 * Always call this unconditionally at the shelf level (rules of hooks); a single
 * call enriches the whole page rather than one fetch per card.
 */
export function useLibraryState(
  ids: string[],
  userId: string | null
): UseQueryResult<LibraryStateMap> & { data: LibraryStateMap } {
  const query = useQuery({
    queryKey: queryKeys.libraryState(userId ?? "", ids),
    enabled: Boolean(userId) && ids.length > 0,
    queryFn: async (): Promise<LibraryStateResponse> => {
      const res = await fetch("/api/library-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      // The route degrades to an empty-map 200, so a non-ok response is a real
      // transport failure — throw so React Query records an error state. The
      // placeholderData below keeps `data` an empty Map regardless.
      if (!res.ok) throw new Error("Library-state fetch failed");
      return res.json();
    },
    // Library state changes only on user mutation; 5m avoids refetch churn while
    // collection mutations invalidate the cache explicitly (PR-D3).
    staleTime: 1000 * 60 * 5,
    placeholderData: EMPTY_STATE,
    select: (data) => new Map(Object.entries(data.states)),
  });

  // `select` runs over placeholderData too, so `data` is always a Map (never
  // undefined) for both the disabled and the errored states.
  return {
    ...query,
    data: query.data ?? new Map(),
  } as UseQueryResult<LibraryStateMap> & { data: LibraryStateMap };
}
