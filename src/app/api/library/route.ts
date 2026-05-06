import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { userMedia, mediaItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

const VALID_STATUSES = ["want_to_watch", "watching", "completed", "paused", "dropped"] as const;
const VALID_TYPES = ["movie", "tv", "anime"] as const;
const MAX_LIMIT = 100;

type WatchStatus = (typeof VALID_STATUSES)[number];
type MediaType = (typeof VALID_TYPES)[number];

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const typeParam = searchParams.get("type");
  const ratingParam = searchParams.get("rating");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  // Validate status filter
  if (statusParam && !VALID_STATUSES.includes(statusParam as WatchStatus)) {
    return NextResponse.json(
      { error: "Invalid status. Must be one of: want_to_watch, watching, completed, paused, dropped" },
      { status: 400 }
    );
  }

  // Validate type filter
  if (typeParam && !VALID_TYPES.includes(typeParam as MediaType)) {
    return NextResponse.json(
      { error: "Invalid type. Must be one of: movie, tv, anime" },
      { status: 400 }
    );
  }

  // Parse pagination params
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam, 10))) : 20;
  const offset = (page - 1) * limit;

  const userId = session.user.id;

  // Build query conditions
  const whereClause = statusParam
    ? and(eq(userMedia.userId, userId), eq(userMedia.status, statusParam as WatchStatus))
    : eq(userMedia.userId, userId);

  // Fetch items using query builder pattern (consistent with rest of codebase)
  const items = await db.query.userMedia.findMany({
    where: whereClause,
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit,
    offset,
  });

  // Filter by type in memory (Drizzle ORM doesn't support join conditions on with)
  const filteredItems = typeParam
    ? items.filter((item) => item.mediaItem?.type === typeParam)
    : items;

  // Calculate total count (without type filter for simplicity, or we could do a separate query)
  const allUserItems = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userId),
  });
  const total = typeParam
    ? filteredItems.length
    : allUserItems.length;

  // Format response with composite publicId
  const data = filteredItems.map((item) => ({
    id: item.id,
    mediaItemId: item.mediaItemId,
    publicId: item.mediaItem
      ? `${item.mediaItem.source}-${item.mediaItem.sourceId}`
      : null,
    status: item.status,
    progress: item.progress,
    rating: item.rating,
    updatedAt: item.updatedAt.toISOString(),
    mediaItem: item.mediaItem
      ? {
          source: item.mediaItem.source,
          sourceId: item.mediaItem.sourceId,
          title: item.mediaItem.title,
          posterPath: item.mediaItem.posterPath,
          type: item.mediaItem.type,
          runtime: item.mediaItem.runtime,
        }
      : null,
  }));

  return NextResponse.json({
    data,
    total,
    page,
    limit,
  });
}