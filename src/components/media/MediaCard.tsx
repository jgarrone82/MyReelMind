import Image from "next/image";
import Link from "next/link";
import type { MediaItem } from "@/lib/api/merge";

interface MediaCardProps {
  media: MediaItem;
  lang?: string;
}

export function MediaCard({ media, lang }: MediaCardProps) {
  const sourceLabel = media.source === "tmdb" ? "TMDB" : "AniList";
  const href = lang ? `/${lang}/media/${media.id}` : null;

  const cardContent = (
    <>
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
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
            className="flex h-full w-full items-center justify-center bg-muted/50"
          >
            <span className="text-4xl text-muted">🎬</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {sourceLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-primary">
          {media.title ?? "Unknown"}
        </h3>
        {media.year && (
          <p className="mt-1 text-xs text-secondary">{media.year}</p>
        )}
        {media.episodes && (
          <p className="mt-1 text-xs text-secondary">
            {media.episodes} episodes
          </p>
        )}
      </div>
    </>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-primary bg-primary shadow-sm transition-shadow hover:shadow-md">
      {href ? (
        <Link href={href} className="flex flex-1 flex-col">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </article>
  );
}
