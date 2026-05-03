"use client";

import { Suspense } from "react";
import { SearchBar } from "@/components/media/SearchBar";
import { MediaGrid } from "@/components/media/MediaGrid";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

function SearchResults() {
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

export default function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search</h1>
      <SearchBar />
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}
