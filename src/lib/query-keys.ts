export const queryKeys = {
  search: (query: string, type: string, year?: number | null, page?: number) =>
    ["search", query, type, year, page] as const,
  mediaDetail: (id: string) => ["media", id] as const,
  userLibrary: (status?: string) => ["library", status] as const,
};
