import { watchStatusEnum } from "@/db/schema";

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
