"use client";

import { useEffect } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

export function SearchBar() {
  const { query, debouncedQuery, type, setQuery, setDebouncedQuery, setType } =
    useSearchFilters();

  const { isFetching } = useSearch(debouncedQuery, type, undefined, 1);

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
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {isFetching && (
          <span
            role="status"
            aria-label="Loading"
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </span>
        )}
      </div>

      <div className="flex-shrink-0">
        <label htmlFor="type-filter" className="sr-only">
          Type
        </label>
        <select
          id="type-filter"
          role="combobox"
          aria-label="Type"
          value={type}
          onChange={(e) =>
            setType(e.target.value as "all" | "movie" | "tv" | "anime")
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-auto"
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="anime">Anime</option>
        </select>
      </div>
    </div>
  );
}
