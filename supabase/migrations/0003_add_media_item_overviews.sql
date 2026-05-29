-- Add a per-locale overview cache to media_items.
--
-- Identity stays one row per (source, source_id); localized descriptions are
-- satellite data stored as a JSON object keyed by app locale, e.g.
--   { "en": "A thief who steals...", "es": "Un ladron que roba..." }
--
-- This avoids multiplying rows per language (which would break the
-- user_media.media_item_id foreign key, since that lookup resolves a single
-- row by (source, source_id)).

ALTER TABLE "media_items"
  ADD COLUMN IF NOT EXISTS "overviews" jsonb;

-- Backfill: seed the existing English overview as the canonical fallback so
-- non-English views can fall back to it instead of showing an empty synopsis.
UPDATE "media_items"
SET "overviews" = jsonb_build_object('en', "overview")
WHERE "overview" IS NOT NULL
  AND "overview" <> ''
  AND "overviews" IS NULL;

-- The media cache upserts via ON CONFLICT (source, source_id), which requires a
-- UNIQUE index on those columns. The table previously had only a NON-unique
-- index, so every upsert raised 42P10 and was swallowed -- nothing was ever
-- cached. Promote it to a unique index. (Table is empty, so no dedupe needed.)
DROP INDEX IF EXISTS "media_items_source_source_id_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "media_items_source_source_id_idx"
  ON "media_items" ("source", "source_id");
