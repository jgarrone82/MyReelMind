import { createClient } from "@/lib/supabase/client";

export type UploadResult =
  | { url: string; error: null }
  | { url: null; error: string };

/**
 * Uploads an avatar image blob to Supabase Storage.
 *
 * @param userId - The authenticated user's ID (used as folder prefix)
 * @param blob - The cropped image blob (image/jpeg)
 * @returns UploadResult with url on success, or error string on failure
 */
export async function uploadAvatar(userId: string, blob: Blob): Promise<UploadResult> {
  const supabase = createClient();
  const timestamp = Date.now();
  const path = `${userId}/${timestamp}.jpg`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error || !data) {
    return { url: null, error: error?.message ?? "Upload failed" };
  }

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}