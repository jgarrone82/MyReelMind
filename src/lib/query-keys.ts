export const queryKeys = {
  search: (query: string, type: string, year?: number | null, page?: number) =>
    ["search", query, type, year, page] as const,
  trending: () => ["trending"] as const,
  userLibrary: (status?: string) => ["library", status] as const,
  // ids are sorted so the key is stable regardless of result order. The userId
  // dimension prevents cross-user cache READS: a logged-out user (or a different
  // user after a switch) keys on a distinct value, so a prior user's cached
  // entry is never read. React Query does NOT auto-evict that stale entry on
  // logout, and no logout invalidation is wired — but the entry is harmless: it
  // is never read under the new key and is eventually garbage-collected.
  // Explicit invalidation runs on MUTATION (status/add/remove call-sites) to
  // clear the ACTIVE user's entries; there is no on-logout invalidation.
  libraryState: (userId: string, ids: string[]) =>
    ["library-state", userId, [...ids].sort()] as const,
};
