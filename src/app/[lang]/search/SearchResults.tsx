"use client";

import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { MediaGrid } from "@/components/media/MediaGrid";

export function SearchResults() {
  const { debouncedQuery, type, year } = useSearchFilters();
  const { data, isLoading } = useSearch(debouncedQuery, type, year);

  if (!debouncedQuery.trim()) {
    return <MediaGrid items={[]} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return <MediaGrid items={data ?? []} />;
}
