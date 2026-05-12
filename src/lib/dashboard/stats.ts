import { eq, desc, count, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import type { UserMediaWithMedia, TypeStat, GenreStat, StatusStat } from "./types";
import type { watchStatusEnum } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

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
    status: row.status as watchStatusEnum,
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