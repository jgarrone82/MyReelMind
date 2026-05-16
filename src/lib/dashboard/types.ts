import type { userMedia, mediaItems } from "@/db/schema";
import type { watchStatusEnum } from "@/db/schema";

export type UserMediaWithMedia = typeof userMedia.$inferSelect & {
  mediaItem?: typeof mediaItems.$inferSelect | null;
};

export type TypeStat = {
  type: "movie" | "tv" | "anime";
  count: number;
};

export type GenreStat = {
  genre: string;
  count: number;
};

export type StatusStat = {
  status: "want_to_watch" | "watching" | "completed" | "paused" | "dropped";
  count: number;
};