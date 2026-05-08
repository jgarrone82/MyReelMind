import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/api/merge";

interface MediaGridProps {
  items: MediaItem[];
  lang?: string;
}

export function MediaGrid({ items, lang }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg font-medium">No results found</p>
        <p className="mt-2 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={item.id} media={item} lang={lang} />
      ))}
    </div>
  );
}
