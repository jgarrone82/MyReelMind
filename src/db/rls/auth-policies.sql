-- RLS Auth Policies for MyReelMind
-- Execute this script in Supabase SQL Editor to enable Row Level Security
-- on the users and user_media tables.

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read any profile (public profiles)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- System can insert user profile (for ensureUserProfile from Server Actions)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================
-- USER_MEDIA TABLE POLICIES
-- ============================================

-- Enable RLS on user_media table
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- Users can read their own library entries
CREATE POLICY "user_media_select_own" ON public.user_media
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own library
CREATE POLICY "user_media_insert_own" ON public.user_media
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own library entries
CREATE POLICY "user_media_update_own" ON public.user_media
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own library
CREATE POLICY "user_media_delete_own" ON public.user_media
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PUBLIC PROFILE POLICIES
-- ============================================

-- Allow reading library entries of public users (for public profile pages)
CREATE POLICY "user_media_select_public" ON public.user_media
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = user_media.user_id AND users.is_public = true)
  );