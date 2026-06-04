export const queryKeys = {
  search: (query: string, type: string, year?: number | null, page?: number) =>
    ["search", query, type, year, page] as const,
  trending: () => ["trending"] as const,
  mediaDetail: (id: string) => ["media", id] as const,
  userLibrary: (status?: string) => ["library", status] as const,
  // ids are sorted so the key is stable regardless of result order. The userId
  // dimension prevents cross-user cache READS: a logged-out user (or a different
  // user after a switch) keys on a distinct value, so a prior user's cached
  // entry is never read. React Query does NOT auto-evict that stale entry on
  // logout — explicit invalidation (on mutation/logout) is what clears it.
  libraryState: (userId: string, ids: string[]) =>
    ["library-state", userId, [...ids].sort()] as const,
};
