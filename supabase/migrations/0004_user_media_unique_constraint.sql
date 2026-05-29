-- addToLibrary upserts user_media via ON CONFLICT (user_id, media_item_id),
-- which requires a UNIQUE index on those columns. The table previously had only
-- a NON-unique index, so every upsert raised 42P10 and was swallowed -- adding
-- to the library never persisted. Promote it to a unique index.
-- (Table is empty, so no dedupe is needed.)

DROP INDEX IF EXISTS "user_media_user_id_media_item_id_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "user_media_user_id_media_item_id_idx"
  ON "user_media" ("user_id", "media_item_id");
