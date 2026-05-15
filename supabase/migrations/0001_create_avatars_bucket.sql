-- Create avatars storage bucket
-- Sprint 7: Avatar Upload feature
-- https://github.com/jgarrone82/MyReelMind/pull/XX

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload own avatar (INSERT)
-- Only authenticated users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Users can update own avatar (UPDATE)
-- Only authenticated users can update their own avatar files
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policy: Public read access to avatars
-- Anyone can read avatars (for profile display)
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
