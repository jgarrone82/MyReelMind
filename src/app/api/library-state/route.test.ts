import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/auth/server", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/dashboard/library-state", () => ({
  getLibraryStateForMediaIds: vi.fn(),
}));

import { getSession } from "@/lib/auth/server";
import { getLibraryStateForMediaIds } from "@/lib/dashboard/library-state";

const mockUserId = "user-uuid-123";

function mockAuthenticated() {
  vi.mocked(getSession).mockResolvedValue({
    user: { id: mockUserId },
  } as unknown as Awaited<ReturnType<typeof getSession>>);
}

function mockUnauthenticated() {
  vi.mocked(getSession).mockResolvedValue(null);
}

function postReq(body: unknown) {
  return new Request("http://localhost:3000/api/library-state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/library-state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 { states: {} } when logged out (degrade, never 401)", async () => {
    mockUnauthenticated();

    const res = await POST(postReq({ ids: ["tmdb-1"] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ states: {} });
    // logged-out must never reach the DB query
    expect(getLibraryStateForMediaIds).not.toHaveBeenCalled();
  });

  it("returns 200 with the resolved states for a logged-in user", async () => {
    mockAuthenticated();
    vi.mocked(getLibraryStateForMediaIds).mockResolvedValue({
      "tmdb-1": "in_library",
    });

    const res = await POST(postReq({ ids: ["tmdb-1", "tmdb-2"] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ states: { "tmdb-1": "in_library" } });
    expect(getLibraryStateForMediaIds).toHaveBeenCalledWith(mockUserId, [
      "tmdb-1",
      "tmdb-2",
    ]);
  });

  it("returns 200 { states: {} } when the lookup throws (honest degrade)", async () => {
    mockAuthenticated();
    vi.mocked(getLibraryStateForMediaIds).mockRejectedValue(new Error("db down"));

    const res = await POST(postReq({ ids: ["tmdb-1"] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ states: {} });
  });

  it("returns 400 when ids is not an array", async () => {
    mockAuthenticated();

    const res = await POST(postReq({ ids: "tmdb-1" }));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty("error");
  });

  it("returns 400 when ids is missing from the body", async () => {
    mockAuthenticated();

    const res = await POST(postReq({ not_ids: true }));

    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("returns 400 when the body is not valid JSON", async () => {
    mockAuthenticated();

    const res = await POST(
      new Request("http://localhost:3000/api/library-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not json",
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("returns 400 when more than 200 ids are sent", async () => {
    mockAuthenticated();
    const ids = Array.from({ length: 201 }, (_, i) => `tmdb-${i}`);

    const res = await POST(postReq({ ids }));

    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
    expect(getLibraryStateForMediaIds).not.toHaveBeenCalled();
  });

  it("returns 200 { states: {} } for an empty ids array", async () => {
    mockAuthenticated();
    vi.mocked(getLibraryStateForMediaIds).mockResolvedValue({});

    const res = await POST(postReq({ ids: [] }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ states: {} });
  });
});
