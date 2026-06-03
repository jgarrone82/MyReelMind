import { getTrending } from "@/lib/search/service";

export async function GET(_request: Request): Promise<Response> {
  try {
    const { results } = await getTrending();
    return Response.json({ results });
  } catch {
    // Honest degradation: never fabricate data. Return an empty list as a real
    // 200 so the hook actually consumes it (the hook throws on !res.ok, so a
    // 500 body would never be read and would trigger React Query retries). The
    // UI then falls back to its existing prompt — no fabricated data, no hard
    // error, no retry storm.
    return Response.json({ results: [] });
  }
}
