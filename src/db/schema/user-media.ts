import { pgTable, uuid, integer, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { mediaItems } from "./media-items";
import { watchStatusEnum } from "./enums";

export const userMedia = pgTable(
  "user_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mediaItemId: uuid("media_item_id")
      .notNull()
      .references(() => mediaItems.id, { onDelete: "cascade" }),
    status: watchStatusEnum("status").notNull(),
    progress: integer("progress").default(0).notNull(),
    rating: integer("rating"),
    notes: text("notes"),
    dates: jsonb("dates").$type<{ startedAt?: string; completedAt?: string }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_media_user_id_status_idx").on(table.userId, table.status),
    index("user_media_user_id_media_item_id_idx").on(table.userId, table.mediaItemId),
  ]
);
