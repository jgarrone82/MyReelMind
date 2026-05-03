-- Migration: fix_user_id_default
-- Removes the default random UUID generator from users.id column.
-- The ID must now be provided explicitly as auth.users.id (from Supabase Auth).
-- This is required for RLS policies to work correctly (auth.uid() = id).

ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;