import { MediaCard } from "./MediaCard";
import type { MediaItem } from "@/lib/api/merge";

interface MediaGridProps {
  items: MediaItem[];
  lang?: string;
  noResults?: string;
  tryAdjusting?: string;
}

export function MediaGrid({ items, lang, noResults, tryAdjusting }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-secondary">
        <p className="text-lg font-medium">{noResults}</p>
        <p className="mt-2 text-sm">{tryAdjusting}</p>
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
