import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { getLibraryStateForMediaIds } from "@/lib/dashboard/library-state";

// Cap the id list so a malicious/oversized body can't fan out into an unbounded
// IN (...) query. A real search page accumulates at most a few dozen ids.
const MAX_IDS = 200;

/**
 * POST /api/library-state — resolve per-result library badge state for a page
 * of search results.
 *
 * Body: `{ ids: string[] }` (composite public ids, e.g. "tmdb-123").
 * Response: `200 { states: Record<publicId, "add"|"in_progress"|"in_library"> }`.
 *
 * This endpoint degrades cosmetics, it does NOT gate access — so:
 * - logged out (no authenticated user) -> `200 { states: {} }` (NOT 401; never error search)
 * - lookup throws -> `200 { states: {} }` (mirror /api/trending honest degrade;
 *   the client hook throws on !res.ok, so a 500 body would never be read and
 *   would trigger a React Query retry storm)
 * - malformed body -> `400 { error }` (defensive; the client never sends this)
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = (body as { ids?: unknown } | null)?.ids;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
    return NextResponse.json(
      { error: "Body must be { ids: string[] }" },
      { status: 400 }
    );
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Too many ids (max ${MAX_IDS})` },
      { status: 400 }
    );
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    // Logged out is a normal empty-map case, not an error.
    return NextResponse.json({ states: {} }, { status: 200 });
  }

  try {
    const states = await getLibraryStateForMediaIds(user.id, ids);
    return NextResponse.json({ states }, { status: 200 });
  } catch {
    // Honest degradation: badges drop silently, search never breaks.
    return NextResponse.json({ states: {} }, { status: 200 });
  }
}
