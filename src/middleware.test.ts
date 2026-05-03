import { describe, it, expect, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { middleware } from "./middleware";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn(async (req: NextRequest) => NextResponse.next({ request: req })),
}));

function createRequest(pathname: string, headers?: Record<string, string>): NextRequest {
  const url = new URL(`http://localhost:3000${pathname}`);
  return new NextRequest(url, { headers });
}

describe("middleware", () => {
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
