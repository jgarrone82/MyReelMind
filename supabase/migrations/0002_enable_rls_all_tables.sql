-- Enable Row Level Security on all public tables
-- Fixes Supabase Security Advisor CRITICAL: "RLS Disabled in Public"
-- on public.users, public.user_media, public.media_items
--
-- Security posture: the app reads/writes ALL data via Drizzle over DATABASE_URL
-- (postgres-js, transaction pooler). That connection uses the table-OWNER role,
-- which BYPASSES RLS. No client/browser code reads these tables through the
-- Supabase JS client / PostgREST (verified: the JS client is used only for auth
-- sessions and avatar storage). Therefore the anon + authenticated REST API
-- needs NO read access to these tables, and the policies below are deliberately
-- restrictive (owner-scoped only). This closes the PostgREST exposure without
-- affecting Drizzle.
--
-- IMPORTANT: the owner-bypass assumption is load-bearing. If DATABASE_URL is
-- ever repointed at a non-owner (least-privilege) role, RLS will start applying
-- to the app and these owner-scoped policies will block server writes — that
-- migration would need explicit service-role / bypass provisions.
--
-- Idempotent: safe to run multiple times (SQL Editor or `supabase db push`).

-- ============================================
-- USERS
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Read only your own row via the API. Public profile pages render server-side
-- via Drizzle (owner), so anon does NOT need to read the users table — this
-- prevents harvesting every user's email through GET /rest/v1/users.
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_delete_own" ON public.users;
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- USER_MEDIA
-- ============================================
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_media_select_own" ON public.user_media;
CREATE POLICY "user_media_select_own" ON public.user_media
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_media_insert_own" ON public.user_media;
CREATE POLICY "user_media_insert_own" ON public.user_media
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_media_update_own" ON public.user_media;
CREATE POLICY "user_media_update_own" ON public.user_media
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_media_delete_own" ON public.user_media;
CREATE POLICY "user_media_delete_own" ON public.user_media
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public profiles are rendered server-side via Drizzle, so anon does NOT need
-- to read other users' library entries through the API. Drop the previously
-- created public-read policy (this migration was applied once with it present).
DROP POLICY IF EXISTS "user_media_select_public" ON public.user_media;

-- ============================================
-- MEDIA_ITEMS (shared catalog, sourced from AniList/TMDB)
-- ============================================
-- RLS enabled with NO policies: the anon/authenticated REST API gets zero
-- access (deny-by-default), which also prevents exposing the raw_data jsonb
-- (full upstream payload). Drizzle (owner) keeps full read/write for the app
-- and the catalog sync. Drop the previously created public-read policy.
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_items_select_public" ON public.media_items;
