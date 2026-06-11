import { eq, desc, count, sql, and, inArray, gte } from "drizzle-orm";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import type { UserMediaWithMedia, DashboardCounts } from "./types";

export async function getTotalWatched(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(and(eq(userMedia.userId, userId), eq(userMedia.status, "completed")));

  return result?.count ?? 0;
}

export async function getTotalHours(userId: string): Promise<number> {
  const [result] = await db
    .select({
      sum: sql<number>`COALESCE(SUM(${mediaItems.runtime}), 0)`,
    })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(and(eq(userMedia.userId, userId), eq(userMedia.status, "completed")));

  return (result?.sum ?? 0) / 60;
}

export async function getRecentActivity(
  userId: string,
  limit: number = 5
): Promise<UserMediaWithMedia[]> {
  const result = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userId),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit,
  });

  return result;
}

/**
 * Receipt "member card" tally. Resolved in a single round trip via conditional
 * aggregation rather than three separate COUNT queries.
 * - inProgress: rows with status in (watching, paused)
 * - toWatch: rows with status = want_to_watch
 * - totalLogged: all rows for the user (any status)
 * Completed count and total hours come from getTotalWatched / getTotalHours.
 */
export async function getDashboardCounts(
  userId: string
): Promise<DashboardCounts> {
  // The FILTER predicates are built from TYPED Drizzle expressions
  // (inArray/eq against userMedia.status) rather than raw string literals, so
  // the status values are checked against the column's enum type at compile
  // time — a future enum rename becomes a type error here. Behavior is
  // identical to the previous `... FILTER (WHERE status IN ('watching','paused'))` SQL.
  const [result] = await db
    .select({
      inProgress: sql<number>`count(*) filter (where ${inArray(userMedia.status, ["watching", "paused"])})`,
      toWatch: sql<number>`count(*) filter (where ${eq(userMedia.status, "want_to_watch")})`,
      totalLogged: sql<number>`count(*)`,
    })
    .from(userMedia)
    .where(eq(userMedia.userId, userId));

  return {
    inProgress: Number(result?.inProgress ?? 0),
    toWatch: Number(result?.toWatch ?? 0),
    totalLogged: Number(result?.totalLogged ?? 0),
  };
}

/**
 * "Pick up where you left off" shelf: rows currently being watched or paused,
 * joined to their media item, newest activity first. No progress % is computed
 * (progress is an episode count with no persisted total).
 */
export async function getInProgressItems(
  userId: string,
  limit: number = 12
): Promise<UserMediaWithMedia[]> {
  const result = await db.query.userMedia.findMany({
    where: and(
      eq(userMedia.userId, userId),
      inArray(userMedia.status, ["watching", "paused"])
    ),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit,
  });

  return result;
}

/**
 * "Recently watched" shelf: completed rows joined to their media item, newest
 * first. Uses updatedAt as the timestamp (no true watched-at field exists).
 */
export async function getRecentlyWatched(
  userId: string,
  limit: number = 12
): Promise<UserMediaWithMedia[]> {
  const result = await db.query.userMedia.findMany({
    where: and(
      eq(userMedia.userId, userId),
      eq(userMedia.status, "completed")
    ),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit,
  });

  return result;
}

/**
 * "Added this week" shelf: rows created within the last 7 days, joined to their
 * media item, newest first. The 7-day cutoff is derived from the current clock,
 * so tests pin it with fake timers.
 */
export async function getAddedThisWeek(
  userId: string,
  limit: number = 12
): Promise<UserMediaWithMedia[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await db.query.userMedia.findMany({
    where: and(
      eq(userMedia.userId, userId),
      gte(userMedia.createdAt, cutoff)
    ),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.createdAt)],
    limit,
  });

  return result;
}