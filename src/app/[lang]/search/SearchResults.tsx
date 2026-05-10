"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useDictionary } from "@/i18n/provider";

interface SearchResultsProps {
  lang?: string;
}

export function SearchResults({ lang }: SearchResultsProps) {
  const dict = useDictionary();
  const { debouncedQuery, type, year, page, setPage } = useSearchFilters();
  const { data, isLoading } = useSearch(debouncedQuery, type, year, page);
  const [allResults, setAllResults] = useState<typeof data["results"]>([]);
  const prevQueryRef = useRef(debouncedQuery);

  // When query changes, reset accumulated results
  useEffect(() => {
    if (debouncedQuery !== prevQueryRef.current) {
      prevQueryRef.current = debouncedQuery;
      setAllResults([]);
    }
  }, [debouncedQuery]);

  // When new data comes in, append to accumulated results
  useEffect(() => {
    if (data && data.results.length > 0) {
      setAllResults((prev) => {
        // If page is 1, replace; otherwise append
        if (page === 1) return data.results;
        // Avoid duplicates by checking if we already have these results
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = data.results.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  const hasResults = allResults.length > 0;

  if (!debouncedQuery.trim()) {
    return <MediaGrid items={[]} lang={lang} />;
  }

  if (isLoading && !hasResults) {
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

  // Show Load More when there are more pages available
  const showLoadMore = hasResults && data && page < data.totalPages;

  return (
    <div className="space-y-4">
      <MediaGrid items={allResults} lang={lang} />
      {showLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? dict.search.loadingMore : dict.search.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
