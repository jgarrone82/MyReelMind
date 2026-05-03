import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { userMedia } from "@/db/schema/user-media";
import type { UserMediaWithMedia } from "./types";

export async function getTotalWatched(userId: string): Promise<number> {
  const result = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userId),
    with: {
      mediaItem: true,
    },
  });

  return result.filter((um) => um.status === "completed").length;
}

export async function getTotalHours(userId: string): Promise<number> {
  const result = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userId),
    with: {
      mediaItem: true,
    },
  });

  const completedItems = result.filter((um) => um.status === "completed");
  const totalMinutes = completedItems.reduce((sum, um) => {
    const runtime = um.mediaItem?.runtime ?? 0;
    return sum + runtime;
  }, 0);

  return totalMinutes / 60;
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