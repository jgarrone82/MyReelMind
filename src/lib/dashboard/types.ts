import type { userMedia, mediaItems } from "@/db/schema";

export type UserMediaWithMedia = typeof userMedia.$inferSelect & {
  mediaItem?: typeof mediaItems.$inferSelect | null;
};