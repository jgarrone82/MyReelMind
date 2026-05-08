/**
 * Formats a media ID into a composite ID using source prefix
 * @param source - "tmdb" | "anilist"
 * @param sourceId - the numeric ID from the source
 * @returns composite ID like "tmdb-123" or "anilist-456"
 */
export function formatPublicId(source: "tmdb" | "anilist", sourceId: string | number): string {
  return `${source}-${sourceId}`;
}

/**
 * Parses a composite media ID into its components
 * @param id - composite ID like "tmdb-123" or "anilist-456"
 * @returns parsed components or null if invalid format
 */
export function parsePublicId(id: string): { source: "tmdb" | "anilist"; sourceId: string } | null {
  if (id.startsWith("tmdb-")) {
    return { source: "tmdb", sourceId: id.replace("tmdb-", "") };
  }
  if (id.startsWith("anilist-")) {
    return { source: "anilist", sourceId: id.replace("anilist-", "") };
  }
  return null;
}