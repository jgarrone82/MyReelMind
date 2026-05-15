import { describe, it, expect } from "vitest";
import { settingsSchema } from "../settings";

describe("settingsSchema - avatarUrl", () => {
  it("should accept null avatarUrl", () => {
    const result = settingsSchema.safeParse({
      displayName: "John Doe",
      avatarUrl: null,
      isPublic: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBeNull();
    }
  });

  it("should accept valid Supabase Storage URL for avatarUrl", () => {
    const validUrls = [
      "https://example.supabase.co/storage/v1/object/public/avatars/user123/1234567890.jpg",
      "https://yourproject.supabase.com/storage/v1/object/public/avatars/abc-123/9876543210.png",
    ];

    for (const url of validUrls) {
      const result = settingsSchema.safeParse({
        displayName: "John Doe",
        avatarUrl: url,
        isPublic: true,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid URL for avatarUrl", () => {
    const result = settingsSchema.safeParse({
      displayName: "John Doe",
      avatarUrl: "not-a-valid-url",
      isPublic: true,
    });
    expect(result.success).toBe(false);
  });

  it("should reject non-Supabase Storage URL for avatarUrl", () => {
    const result = settingsSchema.safeParse({
      displayName: "John Doe",
      avatarUrl: "https://google.com/image.jpg",
      isPublic: true,
    });
    expect(result.success).toBe(false);
  });

  it("should transform empty string avatarUrl to null", () => {
    const result = settingsSchema.safeParse({
      displayName: "John Doe",
      avatarUrl: "",
      isPublic: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.avatarUrl).toBeNull();
    }
  });
});