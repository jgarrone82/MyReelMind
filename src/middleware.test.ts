import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "./middleware";
import { createServerClient } from "@supabase/ssr";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(async (req: NextRequest) => NextResponse.next({ request: req })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/profile-sync", () => ({
  ensureUserProfile: vi.fn().mockResolvedValue(undefined),
}));

function createRequest(pathname: string, headers?: Record<string, string>): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return new NextRequest(url, { headers });
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no session
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      },
    } as unknown as ReturnType<typeof createServerClient>);
  });

  describe("i18n routing", () => {
    it("should redirect root / to /es/", async () => {
      const req = createRequest("/");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/");
    });

    it("should redirect /search to /es/search", async () => {
      const req = createRequest("/search");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/search");
    });

    it("should not redirect when locale is present", async () => {
      const req = createRequest("/es/search");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("should not redirect when locale 'en' is present", async () => {
      const req = createRequest("/en/search");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("static files and API routes", () => {
    it("should not redirect API routes", async () => {
      const req = createRequest("/api/search");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("should not redirect static files", async () => {
      const req = createRequest("/_next/static/chunks/main.js");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("auth gate - protected routes", () => {
    it("should redirect /dashboard to login when no session", async () => {
      const req = createRequest("/es/dashboard");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/login");
    });

    it("should redirect /library to login when no session", async () => {
      const req = createRequest("/es/library");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/login");
    });
  });

  describe("auth gate - auth routes with session", () => {
    it("should redirect /login to dashboard when session exists", async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: {
                user: { id: "user-123", email: "test@example.com" },
              },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const req = createRequest("/es/login");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/dashboard");
    });

    it("should redirect /signup to dashboard when session exists", async () => {
      vi.mocked(createServerClient).mockReturnValue({
        auth: {
          getSession: vi.fn().mockResolvedValue({
            data: {
              session: {
                user: { id: "user-123", email: "test@example.com" },
              },
            },
            error: null,
          }),
        },
      } as unknown as ReturnType<typeof createServerClient>);

      const req = createRequest("/es/signup");
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3000/es/dashboard");
    });
  });

  describe("auth gate - public routes", () => {
    it("should allow /search without session", async () => {
      const req = createRequest("/es/search");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });

    it("should allow /media/123 without session", async () => {
      const req = createRequest("/es/media/tmdb-123");
      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("location")).toBeNull();
    });
  });
});