"use client";

import { useEffect } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

export function SearchBar() {
  const { query, debouncedQuery, setQuery, setDebouncedQuery } =
    useSearchFilters();

  const { isFetching } = useSearch(debouncedQuery, "all", undefined, 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setDebouncedQuery]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <input
          id="search-input"
          type="search"
          role="searchbox"
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies or anime..."
          className="w-full rounded-lg border border-primary px-4 py-3 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {isFetching && (
          <span
            role="status"
            aria-label="Loading"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-accent" />
          </span>
        )}
      </div>
    </div>
  );
}
