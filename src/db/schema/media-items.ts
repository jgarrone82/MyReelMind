import { pgTable, uuid, text, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { mediaSourceEnum, mediaTypeEnum } from "./enums";

export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: mediaSourceEnum("source").notNull(),
    sourceId: text("source_id").notNull(),
    type: mediaTypeEnum("type").notNull(),
    title: text("title").notNull(),
    originalTitle: text("original_title"),
    overview: text("overview"),
    releaseDate: text("release_date"),
    posterPath: text("poster_path"),
    backdropPath: text("backdrop_path"),
    genres: jsonb("genres").$type<string[]>(),
    runtime: integer("runtime"),
    status: text("status"),
    rawData: jsonb("raw_data"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("media_items_source_source_id_idx").on(table.source, table.sourceId),
    index("media_items_source_type_idx").on(table.source, table.type),
  ]
);
