export const queryKeys = {
  search: (query: string, type: string, year?: number | null) =>
    ["search", query, type, year] as const,
  mediaDetail: (id: string) => ["media", id] as const,
  userLibrary: (status?: string) => ["library", status] as const,
};
