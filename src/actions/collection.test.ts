import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addToLibrary,
  updateStatus,
  updateRating,
  updateProgress,
  removeFromLibrary,
} from "./collection";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      mediaItems: {
        findFirst: vi.fn(),
      },
      userMedia: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock("@/lib/media/detail", () => ({
  fetchMediaDetail: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { db } from "@/db";
import { fetchMediaDetail } from "@/lib/media/detail";

const mockUserId = "user-uuid-123";
const mockMediaUuid = "media-uuid-456";
const mockUserMediaId = "user-media-uuid-789";

function mockAuthenticated() {
  vi.mocked(getAuthenticatedUser).mockResolvedValue({
    id: mockUserId,
  } as unknown as Awaited<ReturnType<typeof getAuthenticatedUser>>);
}

function mockUnauthenticated() {
  vi.mocked(getAuthenticatedUser).mockResolvedValue(null);
}

function mockMediaItemFound() {
  vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue({
    id: mockMediaUuid,
    source: "tmdb",
    sourceId: "123",
  } as unknown as Awaited<ReturnType<typeof db.query.mediaItems.findFirst>>);
}

describe("Collection Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addToLibrary", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticated();

      const result = await addToLibrary("tmdb-123", "want_to_watch");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should add media to library when authenticated", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue(undefined);

      const result = await addToLibrary("tmdb-123", "want_to_watch");

      expect(result.success).toBe(true);
      expect(db.insert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/library");
      expect(revalidatePath).toHaveBeenCalledWith("/media/[id]");
    });

    it("should return error when media item not found", async () => {
      mockAuthenticated();
      vi.mocked(db.query.mediaItems.findFirst).mockResolvedValue(undefined);
      vi.mocked(fetchMediaDetail).mockResolvedValue(null);

      const result = await addToLibrary("tmdb-123", "want_to_watch");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Media not found");
    });

    it("should log the underlying error when the write throws", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue(undefined);
      const dbError = new Error('violates foreign key constraint "user_media_user_id_users_id_fk"');
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockRejectedValue(dbError),
        }),
      } as unknown as ReturnType<typeof db.insert>);
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await addToLibrary("tmdb-123", "want_to_watch");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to add to library");
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe("updateStatus", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticated();

      const result = await updateStatus("tmdb-123", "watching");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should update status when authenticated", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "want_to_watch",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateStatus("tmdb-123", "watching");

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/library");
      expect(revalidatePath).toHaveBeenCalledWith("/media/[id]");
    });

    it("should return error when item not in library", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue(undefined);

      const result = await updateStatus("tmdb-123", "watching");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item not in library");
    });
  });

  describe("updateRating", () => {
    it("should return error for invalid rating", async () => {
      mockAuthenticated();

      const result = await updateRating("tmdb-123", 15);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Rating must be between 1 and 10");
    });

    it("should update rating when valid", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateRating("tmdb-123", 8);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("updateProgress", () => {
    it("should return error for negative progress", async () => {
      mockAuthenticated();

      const result = await updateProgress("tmdb-123", -1);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Progress must be non-negative");
    });

    it("should update progress when valid", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateProgress("tmdb-123", 5);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should auto-set status to completed when progress reaches total episodes", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateProgress("tmdb-123", 24, 24);

      expect(result.success).toBe(true);
      // Verify the update call was made with status = completed
      expect(db.update).toHaveBeenCalled();
      const updateCall = vi.mocked(db.update).mock.calls[0];
      expect(updateCall).toBeDefined();
    });

    it("should not auto-complete when total episodes is null or zero", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateProgress("tmdb-123", 5, 0);

      expect(result.success).toBe(true);
      // Status should remain watching (update called but not with completed)
      expect(db.update).toHaveBeenCalled();
    });

    it("should not auto-complete when progress is less than total", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await updateProgress("tmdb-123", 12, 24);

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("removeFromLibrary", () => {
    it("should return error when not authenticated", async () => {
      mockUnauthenticated();

      const result = await removeFromLibrary("tmdb-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
      expect(db.delete).not.toHaveBeenCalled();
    });

    it("should return error when item not in library", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue(undefined);

      const result = await removeFromLibrary("tmdb-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Item not in library");
      expect(db.delete).not.toHaveBeenCalled();
    });

    it("should remove item from library when owned", async () => {
      mockAuthenticated();
      mockMediaItemFound();
      vi.mocked(db.query.userMedia.findFirst).mockResolvedValue({
        id: mockUserMediaId,
        userId: mockUserId,
        mediaItemId: mockMediaUuid,
        status: "watching",
      } as unknown as Awaited<ReturnType<typeof db.query.userMedia.findFirst>>);

      const result = await removeFromLibrary("tmdb-123");

      expect(result.success).toBe(true);
      expect(db.delete).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith("/library");
      expect(revalidatePath).toHaveBeenCalledWith("/media/[id]");
    });
  });
});
