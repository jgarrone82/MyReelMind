import { pgEnum } from "drizzle-orm/pg-core";

export const mediaSourceEnum = pgEnum("media_source", ["tmdb", "anilist"]);
export const mediaTypeEnum = pgEnum("media_type", ["movie", "tv", "anime"]);
export const watchStatusEnum = pgEnum("watch_status", [
  "want_to_watch",
  "watching",
  "completed",
  "paused",
  "dropped",
]);
