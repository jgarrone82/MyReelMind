import { eq, desc, count, sql, and, inArray, gte } from "drizzle-orm";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import type { UserMediaWithMedia, TypeStat, GenreStat, StatusStat, DashboardCounts } from "./types";
import type { watchStatusEnum } from "@/db/schema";

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

export async function getStatsByType(
  userId: string
): Promise<TypeStat[]> {
  const result = await db
    .select({
      type: mediaItems.type,
      count: count(),
    })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(eq(userMedia.userId, userId))
    .groupBy(mediaItems.type)
    .orderBy(desc(count()));

  return result
    .map((row) => ({
      type: row.type as "movie" | "tv" | "anime",
      count: row.count,
    }))
    .filter((s) => s.count > 0);
}

export async function getStatsByGenre(
  userId: string
): Promise<GenreStat[]> {
  const result = await db
    .select({
      genre: sql<string>`jsonb_array_elements_text(${mediaItems.genres})`,
      count: count(),
    })
    .from(userMedia)
    .innerJoin(mediaItems, eq(userMedia.mediaItemId, mediaItems.id))
    .where(eq(userMedia.userId, userId))
    .groupBy(sql`jsonb_array_elements_text(${mediaItems.genres})`)
    .orderBy(desc(count()))
    .limit(5);

  return result.map((row) => ({
    genre: row.genre,
    count: row.count,
  }));
}

export async function getStatsByStatus(
  userId: string
): Promise<StatusStat[]> {
  const result = await db
    .select({
      status: userMedia.status,
      count: count(),
    })
    .from(userMedia)
    .where(eq(userMedia.userId, userId))
    .groupBy(userMedia.status)
    .orderBy(desc(count()));

  return result.map((row) => ({
    status: row.status as "want_to_watch" | "watching" | "completed" | "paused" | "dropped",
    count: row.count,
  }));
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
  const [result] = await db
    .select({
      inProgress: sql<number>`COUNT(*) FILTER (WHERE ${userMedia.status} IN ('watching', 'paused'))`,
      toWatch: sql<number>`COUNT(*) FILTER (WHERE ${userMedia.status} = 'want_to_watch')`,
      totalLogged: sql<number>`COUNT(*)`,
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