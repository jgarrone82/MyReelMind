export const queryKeys = {
  search: (query: string, type: string, year?: number | null, page?: number) =>
    ["search", query, type, year, page] as const,
  trending: () => ["trending"] as const,
  mediaDetail: (id: string) => ["media", id] as const,
  userLibrary: (status?: string) => ["library", status] as const,
  // ids are sorted so the key is stable regardless of result order; the userId
  // dimension prevents cross-user cache bleed and auto-evicts on logout.
  libraryState: (userId: string, ids: string[]) =>
    ["library-state", userId, [...ids].sort()] as const,
};
