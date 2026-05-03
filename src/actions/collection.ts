"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { mediaItems, userMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { fetchMediaDetail } from "@/lib/media/detail";

function parseMediaId(id: string): { source: "tmdb" | "anilist"; sourceId: string } | null {
  if (id.startsWith("tmdb-")) {
    return { source: "tmdb", sourceId: id.replace("tmdb-", "") };
  }
  if (id.startsWith("anilist-")) {
    return { source: "anilist", sourceId: id.replace("anilist-", "") };
  }
  return null;
}

async function getMediaItemUuid(id: string): Promise<string | null> {
  const parsed = parseMediaId(id);
  if (!parsed) return null;

  const existing = await db.query.mediaItems.findFirst({
    where: and(eq(mediaItems.source, parsed.source), eq(mediaItems.sourceId, parsed.sourceId)),
  });

  if (existing) return existing.id;

  // Try to fetch and cache
  const media = await fetchMediaDetail(id);
  if (!media) return null;

  const refreshed = await db.query.mediaItems.findFirst({
    where: and(eq(mediaItems.source, parsed.source), eq(mediaItems.sourceId, parsed.sourceId)),
  });

  return refreshed?.id ?? null;
}

export async function addToLibrary(
  mediaId: string,
  initialStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const mediaItemId = await getMediaItemUuid(mediaId);
    if (!mediaItemId) {
      return { success: false, error: "Media not found" };
    }

    const userId = session.user.id;

    await db
      .insert(userMedia)
      .values({
        userId,
        mediaItemId,
        status: initialStatus as "want_to_watch" | "watching" | "completed" | "paused" | "dropped",
        progress: 0,
      })
      .onConflictDoUpdate({
        target: [userMedia.userId, userMedia.mediaItemId],
        set: {
          status: initialStatus as "want_to_watch" | "watching" | "completed" | "paused" | "dropped",
          updatedAt: new Date(),
        },
      });

    revalidatePath("/library");
    revalidatePath("/media/[id]");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to add to library" };
  }
}

export async function updateStatus(
  mediaId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const mediaItemId = await getMediaItemUuid(mediaId);
    if (!mediaItemId) {
      return { success: false, error: "Media not found" };
    }

    const userId = session.user.id;

    const existing = await db.query.userMedia.findFirst({
      where: and(eq(userMedia.userId, userId), eq(userMedia.mediaItemId, mediaItemId)),
    });

    if (!existing) {
      return { success: false, error: "Item not in library" };
    }

    await db
      .update(userMedia)
      .set({
        status: newStatus as "want_to_watch" | "watching" | "completed" | "paused" | "dropped",
        updatedAt: new Date(),
      })
      .where(eq(userMedia.id, existing.id));

    revalidatePath("/library");
    revalidatePath("/media/[id]");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

export async function updateRating(
  mediaId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (rating < 1 || rating > 10) {
      return { success: false, error: "Rating must be between 1 and 10" };
    }

    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const mediaItemId = await getMediaItemUuid(mediaId);
    if (!mediaItemId) {
      return { success: false, error: "Media not found" };
    }

    const userId = session.user.id;

    const existing = await db.query.userMedia.findFirst({
      where: and(eq(userMedia.userId, userId), eq(userMedia.mediaItemId, mediaItemId)),
    });

    if (!existing) {
      return { success: false, error: "Item not in library" };
    }

    await db
      .update(userMedia)
      .set({
        rating,
        updatedAt: new Date(),
      })
      .where(eq(userMedia.id, existing.id));

    revalidatePath("/library");
    revalidatePath("/media/[id]");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update rating" };
  }
}

export async function updateProgress(
  mediaId: string,
  progress: number,
  _totalEpisodes?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (progress < 0) {
      return { success: false, error: "Progress must be non-negative" };
    }

    const session = await getSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const mediaItemId = await getMediaItemUuid(mediaId);
    if (!mediaItemId) {
      return { success: false, error: "Media not found" };
    }

    const userId = session.user.id;

    const existing = await db.query.userMedia.findFirst({
      where: and(eq(userMedia.userId, userId), eq(userMedia.mediaItemId, mediaItemId)),
    });

    if (!existing) {
      return { success: false, error: "Item not in library" };
    }

    await db
      .update(userMedia)
      .set({
        progress,
        updatedAt: new Date(),
      })
      .where(eq(userMedia.id, existing.id));

    revalidatePath("/library");
    revalidatePath("/media/[id]");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to update progress" };
  }
}
