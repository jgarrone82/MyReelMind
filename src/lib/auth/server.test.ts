import { describe, it, expect, vi } from "vitest";
import { getSession, getAuthenticatedUser } from "./server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("getSession", () => {
  it("should return session when user is authenticated", async () => {
    const mockSession = { user: { id: "user-123", email: "test@example.com" } };
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getSession();
    expect(result).toEqual(mockSession);
  });

  it("should return null when no session exists", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getSession();
    expect(result).toBeNull();
  });

  it("should return null when getSession throws", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockRejectedValue(new Error("Network error")),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getSession();
    expect(result).toBeNull();
  });
});

describe("getAuthenticatedUser", () => {
  it("should return the revalidated user when getUser resolves with a user", async () => {
    const mockUser = { id: "user-123", email: "test@example.com" };
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getAuthenticatedUser();
    expect(result).toEqual(mockUser);
  });

  it("should return null when getUser resolves with no user", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it("should return null when getUser resolves with an error", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Auth session missing" },
        }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it("should return null when getUser throws", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockRejectedValue(new Error("Network error")),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getAuthenticatedUser();
    expect(result).toBeNull();
  });

  it("revalidates via getUser and never reads the unverified getSession (#52)", async () => {
    const getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const getSessionSpy = vi.fn();
    const mockSupabase = { auth: { getUser, getSession: getSessionSpy } };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>);

    await getAuthenticatedUser();
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(getSessionSpy).not.toHaveBeenCalled();
  });
});
