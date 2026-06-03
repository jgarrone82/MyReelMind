import { getTrending } from "@/lib/search/service";

export async function GET(_request: Request): Promise<Response> {
  try {
    const { results } = await getTrending();
    return Response.json({ results });
  } catch {
    // Honest degradation: never fabricate data. The empty result lets the UI
    // fall back to its existing prompt instead of surfacing a hard error.
    return Response.json({ results: [] }, { status: 500 });
  }
}
