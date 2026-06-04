import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { mediaItems, userMedia, watchStatusEnum } from "@/db/schema";
import { formatPublicId, parsePublicId } from "@/lib/media/formatPublicId";

/**
 * Watch status as stored on `user_media.status`. Derived from the Drizzle enum
 * so a future enum change becomes a type error here rather than silent drift.
 */
export type WatchStatus = (typeof watchStatusEnum.enumValues)[number];

/**
 * The three observable badge states a search result can have. The 5-status
 * `user_media` enum collapses to exactly 3 states (see `mapStatusToBadge`).
 */
export type LibraryBadgeState = "add" | "in_progress" | "in_library";

/**
 * Pure mapping from a `user_media` status (or null = no row) to a badge state.
 *
 * - no row (null) -> ADD
 * - watching | paused -> IN PROGRESS (mirrors getDashboardCounts.inProgress)
 * - want_to_watch | completed | dropped -> IN LIBRARY (dropped is a real
 *   tracked row, never ADD)
 */
export function mapStatusToBadge(status: WatchStatus | null): LibraryBadgeState {
  if (status === null) return "add";
  switch (status) {
    case "watching":
    case "paused":
      return "in_progress";
    case "want_to_watch":
    case "completed":
    case "dropped":
      return "in_library";
  }
}

/**
 * Resolve the per-result badge state for a page of search results in ONE batch
 * query. Public ids are composite (e.g. "tmdb-123", "anilist-456") and are
 * parsed into (source, sourceId) via `parsePublicId`; unparseable ids are
 * silently skipped so a single malformed id never breaks the whole lookup.
 *
 * The result Record is keyed by the SAME composite public id the caller sent,
 * so the client can merge by direct lookup. Only ids with a real `user_media`
 * row owned by `userId` appear as keys — an absent id means ADD (the client's
 * default). If nothing parses, returns `{}` WITHOUT touching the database.
 *
 * Honest-data: the query filters by `userId`, so another user's rows are never
 * returned. Lives in `lib/dashboard` (not collection.ts) to stay out of
 * "use server" and remain unit-testable + importable by the route handler.
 */
export async function getLibraryStateForMediaIds(
  userId: string,
  publicIds: string[]
): Promise<Record<string, LibraryBadgeState>> {
  const tmdbIds: string[] = [];
  const anilistIds: string[] = [];

  for (const publicId of publicIds) {
    const parsed = parsePublicId(publicId);
    // Skip malformed ids — including structurally-parsed-but-empty source ids
    // like "tmdb-"/"anilist-" (parsePublicId returns sourceId: "" for these),
    // which would otherwise reach the DB as inArray(sourceId, [""]).
    if (!parsed || parsed.sourceId === "") continue;
    if (parsed.source === "tmdb") {
      tmdbIds.push(parsed.sourceId);
    } else {
      anilistIds.push(parsed.sourceId);
    }
  }

  // No valid ids after parsing -> no work to do, no DB round-trip.
  if (tmdbIds.length === 0 && anilistIds.length === 0) {
    return {};
  }

  // OR of per-source (source, inArray(sourceId)) groups, so a single query
  // covers a page mixing TMDB and AniList results. `or(...)` with one group is
  // also valid (the empty group simply contributes no clause).
  const sourceClauses = [
    tmdbIds.length > 0
      ? and(eq(mediaItems.source, "tmdb"), inArray(mediaItems.sourceId, tmdbIds))
      : undefined,
    anilistIds.length > 0
      ? and(eq(mediaItems.source, "anilist"), inArray(mediaItems.sourceId, anilistIds))
      : undefined,
  ];

  const rows = await db
    .select({
      source: mediaItems.source,
      sourceId: mediaItems.sourceId,
      status: userMedia.status,
    })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(and(eq(userMedia.userId, userId), or(...sourceClauses)));

  const result: Record<string, LibraryBadgeState> = {};
  for (const row of rows) {
    const publicId = formatPublicId(row.source, row.sourceId);
    result[publicId] = mapStatusToBadge(row.status);
  }
  return result;
}
