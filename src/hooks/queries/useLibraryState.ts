import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { LibraryBadgeState } from "@/lib/dashboard/library-state";

interface LibraryStateResponse {
  states: Record<string, LibraryBadgeState>;
}

// ReadonlyMap (not Map) so consumers cannot mutate the shared, module-level
// EMPTY_MAP singleton that the disabled/error paths return. Reads (`get`/`has`/
// `size`/iteration) are all that downstream enrichment needs.
export type LibraryStateMap = ReadonlyMap<string, LibraryBadgeState>;

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
 * - the consumer ALWAYS reads a `Map`. There is NO `placeholderData`: the
 *   `?? EMPTY_MAP` fallback in the return below is the SOLE source of the
 *   "always a Map" guarantee. It covers every non-success path (disabled,
 *   pending, error) where `query.data` is `undefined`, so a failed/slow lookup
 *   degrades silently (badges drop) instead of throwing or yielding `undefined`.
 * - because there is no `placeholderData`, `isSuccess` flips true ONLY after a
 *   real successful response. The SearchResults badge gate relies on this: it
 *   must not paint badges over an empty Map during the in-flight window, and an
 *   honest `isSuccess` is what keeps it from doing so.
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
      // `?? EMPTY_MAP` fallback below keeps `data` an empty Map regardless.
      if (!res.ok) throw new Error("Library-state fetch failed");
      return res.json();
    },
    // Library state changes only on user mutation; 5m avoids refetch churn while
    // collection mutations invalidate the cache explicitly (PR-D3).
    staleTime: 1000 * 60 * 5,
    select: selectStatesMap,
  });

  // The consumer must ALWAYS read a Map, and `query.data` is `undefined` on every
  // non-success path. The `?? EMPTY_MAP` fallback is the SINGLE guard that covers
  // all of them — there is no `placeholderData`, so `isSuccess` stays false (and
  // the SearchResults gate paints no badges) until a real response lands:
  //  - DISABLED (logged out / no ids): the query never runs, `select` never runs,
  //    so `query.data` is `undefined` → `?? EMPTY_MAP`.
  //  - PENDING (fetch in flight): no `placeholderData` means `query.data` is still
  //    `undefined` and `status` is `pending` → `?? EMPTY_MAP` (status stays
  //    pending, NOT success).
  //  - ERROR (fetch reject or non-ok HTTP): `select` does not run, so `query.data`
  //    is `undefined` → `?? EMPTY_MAP`.
  // `EMPTY_MAP` is a shared, never-mutated instance so these paths also keep a
  // stable identity across re-renders.
  return {
    ...query,
    data: query.data ?? EMPTY_MAP,
  } as UseQueryResult<LibraryStateMap> & { data: LibraryStateMap };
}
