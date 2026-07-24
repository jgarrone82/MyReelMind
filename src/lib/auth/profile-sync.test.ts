import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensureUserProfile } from "./profile-sync";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

import { db } from "@/db";

const mockAuthUser = {
  id: "auth-user-uuid-123",
  email: "test@example.com",
  created_at: "2024-01-15T10:30:00.000Z",
  user_metadata: {
    full_name: "Test User",
    avatar_url: "https://example.com/avatar.png",
  },
} as unknown as Parameters<typeof ensureUserProfile>[0];

describe("ensureUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when authUser is null", () => {
    it("should do nothing (early return)", async () => {
      await ensureUserProfile(null);

      // No DB operations should be called
      expect(db.select).not.toHaveBeenCalled();
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe("when profile already exists", () => {
    it("should not insert a new row (idempotent check)", async () => {
      // Mock existing profile found
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "auth-user-uuid-123" }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      await ensureUserProfile(mockAuthUser);

      // SELECT was called to check existence
      expect(db.select).toHaveBeenCalled();
      // INSERT was NOT called because profile exists
      expect(db.insert).not.toHaveBeenCalled();
    });

    it("should upsert by email when same email exists but with different id", async () => {
      // Mock: the WHERE eq(users.id, authUser.id) returns empty — no profile
      // with this auth id exists yet, even though another profile has the same email.
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const onConflictMock = vi.fn().mockResolvedValue(undefined);
      const valuesMock = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictMock });
      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as unknown as ReturnType<typeof db.insert>);

      await ensureUserProfile(mockAuthUser);

      // Must INSERT with onConflictDoUpdate to handle email UNIQUE constraint
      expect(db.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "auth-user-uuid-123",
          email: "test@example.com",
        })
      );
      expect(onConflictMock).toHaveBeenCalledWith({
        target: expect.anything(), // users.email column
        set: expect.objectContaining({
          id: "auth-user-uuid-123",
          displayName: "Test User",
          avatarUrl: "https://example.com/avatar.png",
        }),
      });
    });
  });

  describe("when profile does not exist", () => {
    it("should insert a new profile with authUser.id", async () => {
      // Mock no existing profile
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const onConflictMock = vi.fn().mockResolvedValue(undefined);
      const valuesMock = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictMock });
      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as unknown as ReturnType<typeof db.insert>);

      await ensureUserProfile(mockAuthUser);

      // Verify insert was called with correct id
      expect(db.insert).toHaveBeenCalled();
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "auth-user-uuid-123", // CRITICAL: must be authUser.id, NOT random
          email: "test@example.com",
          displayName: "Test User",
          avatarUrl: "https://example.com/avatar.png",
        })
      );
    });

    it("should handle missing metadata gracefully", async () => {
      // Mock no existing profile
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const onConflictMock = vi.fn().mockResolvedValue(undefined);
      const valuesMock = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictMock });
      vi.mocked(db.insert).mockReturnValue({
        values: valuesMock,
      } as unknown as ReturnType<typeof db.insert>);

      const userWithoutMeta = {
        id: "auth-user-uuid-456",
        email: "nometa@example.com",
        created_at: "2024-01-15T10:30:00.000Z",
        user_metadata: {},
      };

      await ensureUserProfile(userWithoutMeta as Parameters<typeof ensureUserProfile>[0]);

      // Verify insert was called with nulls for missing metadata
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "auth-user-uuid-456",
          displayName: null,
          avatarUrl: null,
        })
      );
    });
  });
});