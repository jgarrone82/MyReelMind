import { describe, it, expect, vi } from "vitest";
import { getSession } from "./server";

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

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

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

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    const result = await getSession();
    expect(result).toBeNull();
  });

  it("should return null when getSession throws", async () => {
    const mockSupabase = {
      auth: {
        getSession: vi.fn().mockRejectedValue(new Error("Network error")),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as ReturnType<typeof createClient>);

    const result = await getSession();
    expect(result).toBeNull();
  });
});
