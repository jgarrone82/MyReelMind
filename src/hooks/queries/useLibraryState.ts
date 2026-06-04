import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { LibraryBadgeState } from "@/lib/dashboard/library-state";

interface LibraryStateResponse {
  states: Record<string, LibraryBadgeState>;
}

const EMPTY_STATE: LibraryStateResponse = { states: {} };

export type LibraryStateMap = Map<string, LibraryBadgeState>;

// Stable, module-level identities so the hook does not allocate a fresh Map or
// a fresh `select` closure on every render. React Query memoizes `select`
// output by reference, so a stable function lets the same response yield the
// same Map identity across re-renders — which downstream memoization (PR-D3
// wires this at the shelf level over all results) relies on.
const selectStatesMap = (data: LibraryStateResponse): LibraryStateMap =>
  new Map(Object.entries(data.states));

// Shared stable fallback for disabled/error states. The Map is only read by
// consumers, never mutated, so a single shared instance is safe.
const EMPTY_MAP: LibraryStateMap = new Map();

/**
 * Enrich a page of search results with their per-user library-state badge.
 *
 * Cosmetic, non-blocking, and resilient by contract:
 * - `enabled` only when there is a `userId` AND at least one id, so a logged-out
 *   user or an empty results page NEVER issues a request.
 * - the consumer ALWAYS reads a `Map`. Before the first response `placeholderData`
 *   seeds an empty Map (status pending), and on error the `?? EMPTY_MAP` fallback
 *   takes over (see the return below), so a failed/slow lookup degrades silently
 *   (badges drop) instead of throwing or yielding `undefined`.
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
    select: selectStatesMap,
  });

  // The consumer must ALWAYS read a Map. Two distinct paths guarantee that:
  //  - DISABLED (logged out / no ids): the query is `pending`, so React Query
  //    surfaces `placeholderData` (the empty state) and runs `select` over it,
  //    yielding an empty Map.
  //  - ERROR (fetch reject or non-ok HTTP): in React Query v5 `placeholderData`
  //    applies ONLY while `status === "pending"`. On error it does NOT fire and
  //    `select` does NOT run, so `query.data` is `undefined`. The `?? EMPTY_MAP`
  //    fallback below is the REAL guard that keeps the error path a Map.
  // `EMPTY_MAP` is a shared, never-mutated instance so disabled/error states
  // also keep a stable identity across re-renders.
  return {
    ...query,
    data: query.data ?? EMPTY_MAP,
  } as UseQueryResult<LibraryStateMap> & { data: LibraryStateMap };
}
