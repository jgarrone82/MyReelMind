import { LibraryItem } from "./LibraryItem";
import type { WatchStatus } from "./StatusSelector";
import { TypeFilterChips } from "@/components/library/TypeFilterChips";
import { PaginationControls } from "@/components/library/PaginationControls";

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
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
  statusParam?: string | null;
  typeParam?: string | null;
  dict: {
    remove: string;
    removeConfirm: string;
    cancel?: string;
    noEpisodes: string;
    statusUpdated: string;
    ratingUpdated: string;
    progressUpdated: string;
    removed: string;
    error: string;
    status: {
      want_to_watch: string;
      watching: string;
      completed: string;
      paused: string;
      dropped: string;
    };
    statusLabel: string;
    rating: string;
    yourRating: string;
    notRated: string;
    clear: string;
    progress: string;
    episode: string;
    chapter: string;
    of: string;
    previous?: string;
    next?: string;
    page?: string;
    totalItems?: string;
    allTypes?: string;
    filterMovie?: string;
    filterTv?: string;
    filterAnime?: string;
  };
}

export function LibraryGrid({
  items,
  lang,
  totalItems,
  currentPage,
  totalPages,
  statusParam,
  typeParam,
  dict,
}: LibraryGridProps) {
  if (items.length === 0) {
    return null;
  }

  const showPagination = totalItems !== undefined && currentPage !== undefined && totalPages !== undefined;

  return (
    <div>
      {showPagination && (
        <div className="mb-4">
          <TypeFilterChips
            lang={lang}
            currentType={typeParam ?? null}
            currentStatus={statusParam ?? null}
            dict={{
              allTypes: dict.allTypes ?? "All Types",
              filterMovie: dict.filterMovie ?? "Movies",
              filterTv: dict.filterTv ?? "TV Shows",
              filterAnime: dict.filterAnime ?? "Anime",
            }}
          />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <LibraryItem
            key={item.id}
            mediaId={item.publicId}
            title={item.mediaItem.title ?? "Unknown"}
            posterPath={item.mediaItem.posterPath}
            status={item.status}
            progress={item.progress}
            rating={item.rating}
            type={item.mediaItem.type}
            runtime={item.mediaItem.runtime}
            dict={dict}
          />
        ))}
      </div>
      {showPagination && (
        <PaginationControls
          lang={lang}
          currentPage={currentPage}
          totalPages={totalPages}
          currentStatus={statusParam ?? null}
          currentType={typeParam ?? null}
          totalItems={totalItems}
          dict={{
            previous: dict.previous ?? "Previous",
            next: dict.next ?? "Next",
            page: dict.page ?? "Page",
            totalItems: dict.totalItems ?? "items",
          }}
        />
      )}
    </div>
  );
}