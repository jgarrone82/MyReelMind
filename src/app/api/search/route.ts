import { searchMedia } from "@/lib/search/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "all";
  const year = searchParams.get("year");
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  if (!query.trim()) {
    return Response.json({ results: [], page: 1, totalPages: 0 });
  }

  const results = await searchMedia(query, {
    page,
    type: type as "all" | "movie" | "tv" | "anime",
    year: year ? parseInt(year, 10) : undefined,
  });

  // For simplicity, derive totalPages from results length.
  // When page returns fewer items than a full page, we've reached the last page.
  const RESULTS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(results.length / RESULTS_PER_PAGE));

  return Response.json({ results, page, totalPages });
}
