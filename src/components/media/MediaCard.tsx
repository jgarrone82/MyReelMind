import Image from "next/image";
import type { MediaItem } from "@/lib/api/merge";

interface MediaCardProps {
  media: MediaItem;
}

export function MediaCard({ media }: MediaCardProps) {
  const sourceLabel = media.source === "tmdb" ? "TMDB" : "AniList";

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
        {media.coverImage ? (
          <Image
            src={media.coverImage}
            alt={`${media.title ?? "Unknown"} poster`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={`${media.title ?? "Unknown"} poster`}
            className="flex h-full w-full items-center justify-center bg-gray-200"
          >
            <span className="text-4xl text-gray-400">🎬</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {sourceLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {media.title ?? "Unknown"}
        </h3>
        {media.year && (
          <p className="mt-1 text-xs text-gray-500">{media.year}</p>
        )}
        {media.episodes && (
          <p className="mt-1 text-xs text-gray-500">
            {media.episodes} episodes
          </p>
        )}
      </div>
    </article>
  );
}
