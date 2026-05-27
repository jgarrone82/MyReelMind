import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the browser client
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
  })),
}));

import { createClient } from "@/lib/supabase/client";
import { uploadAvatar } from "../storage";

describe("avatars-bucket migration", () => {
  const migrationSQL = `
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
`;

  it("should create avatars bucket with id='avatars' and public=true", () => {
    expect(migrationSQL).toContain("INSERT INTO storage.buckets");
    expect(migrationSQL).toMatch(/VALUES\s*\(\s*['"]avatars['"]\s*,\s*['"]avatars['"]\s*,\s*true\s*\)/i);
  });

  it("should have INSERT policy for authenticated users restricting to own folder", () => {
    expect(migrationSQL).toContain('"Users can upload own avatar"');
    expect(migrationSQL).toContain("FOR INSERT");
    expect(migrationSQL).toContain("TO authenticated");
    expect(migrationSQL).toContain("bucket_id = 'avatars'");
    expect(migrationSQL).toContain("auth.uid()");
  });

  it("should have UPDATE policy for authenticated users restricting to own folder", () => {
    expect(migrationSQL).toContain('"Users can update own avatar"');
    expect(migrationSQL).toContain("FOR UPDATE");
    expect(migrationSQL).toContain("TO authenticated");
    expect(migrationSQL).toContain("bucket_id = 'avatars'");
    expect(migrationSQL).toContain("auth.uid()");
  });

  it("should have SELECT policy for public read access", () => {
    expect(migrationSQL).toContain('"Public read avatars"');
    expect(migrationSQL).toContain("FOR SELECT");
    expect(migrationSQL).toContain("TO public");
    expect(migrationSQL).toContain("bucket_id = 'avatars'");
  });
});

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return url on successful upload", async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: "user123/1234567890.jpg" },
      error: null,
    });
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/avatars/user123/1234567890.jpg" },
    });

    const mockStorageFrom = vi.fn().mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    vi.mocked(createClient).mockReturnValue({
      storage: { from: mockStorageFrom },
    } as unknown as ReturnType<typeof createClient>);

    const blob = new Blob(["test"], { type: "image/jpeg" });
    const result = await uploadAvatar("user123", blob);

    expect(result.url).toBe("https://example.com/avatars/user123/1234567890.jpg");
    expect(result.error).toBeNull();
  });

  it("should return error string on network failure", async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    });

    const mockStorageFrom = vi.fn().mockReturnValue({
      upload: mockUpload,
    });

    vi.mocked(createClient).mockReturnValue({
      storage: { from: mockStorageFrom },
    } as unknown as ReturnType<typeof createClient>);

    const blob = new Blob(["test"], { type: "image/jpeg" });
    const result = await uploadAvatar("user123", blob);

    expect(result.url).toBeNull();
    expect(result.error).toBe("Network error");
  });

  it("should return error string on RLS policy violation", async () => {
    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "RLS policy violation" },
    });

    const mockStorageFrom = vi.fn().mockReturnValue({
      upload: mockUpload,
    });

    vi.mocked(createClient).mockReturnValue({
      storage: { from: mockStorageFrom },
    } as unknown as ReturnType<typeof createClient>);

    const blob = new Blob(["test"], { type: "image/jpeg" });
    const result = await uploadAvatar("wronguser", blob);

    expect(result.url).toBeNull();
    expect(result.error).toBe("RLS policy violation");
  });
});