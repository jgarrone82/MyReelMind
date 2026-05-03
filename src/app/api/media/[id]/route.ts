import { fetchMediaDetail } from "@/lib/media/detail";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const media = await fetchMediaDetail(id);

  if (!media) {
    return Response.json({ error: "Media not found" }, { status: 404 });
  }

  return Response.json(media);
}
