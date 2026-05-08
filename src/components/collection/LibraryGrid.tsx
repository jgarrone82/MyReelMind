import { LibraryItem } from "./LibraryItem";
import type { WatchStatus } from "./StatusSelector";

interface LibraryItemData {
  id: string;
  mediaItemId: string;
  publicId: string;
  status: WatchStatus;
  progress: number;
  rating: number | null;
  updatedAt: string;
  mediaItem: {
    source: "tmdb" | "anilist";
    sourceId: string;
    title: string | null;
    posterPath: string | null;
    type: "movie" | "tv" | "anime";
    runtime: number | null;
  };
}

interface LibraryGridProps {
  items: LibraryItemData[];
  lang: string;
  dict: {
    remove: string;
    removeConfirm: string;
    noEpisodes: string;
    statusUpdated: string;
    ratingUpdated: string;
    progressUpdated: string;
    removed: string;
    error: string;
  };
}

export function LibraryGrid({ items, lang, dict }: LibraryGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <LibraryItem
          key={item.id}
          id={item.id}
          mediaId={item.publicId}
          publicId={item.publicId}
          title={item.mediaItem.title ?? "Unknown"}
          posterPath={item.mediaItem.posterPath}
          status={item.status}
          progress={item.progress}
          rating={item.rating}
          type={item.mediaItem.type}
          runtime={item.mediaItem.runtime}
          lang={lang}
          dict={dict}
        />
      ))}
    </div>
  );
}