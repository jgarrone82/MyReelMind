"use client";

import { useEffect } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { useSearchFilters } from "@/stores/search-filters";
import { queryKeys } from "@/lib/query-keys";

interface SearchBarProps {
  placeholder: string;
  /** Label for the CLEAR control shown while the query is non-empty. */
  clearLabel?: string;
}

export function SearchBar({ placeholder, clearLabel = "Clear" }: SearchBarProps) {
  const { query, debouncedQuery, type, year, setQuery, setDebouncedQuery } =
    useSearchFilters();

  // Reflect the ACTIVE results query's fetching state instead of firing a
  // second query. SearchResults drives `useSearch(debouncedQuery, type, year,
  // page)` off the same store; we observe ANY page of that query via a prefix
  // match (query+type+year) so the spinner tracks the real request rather than
  // a divergent hardcoded key. See issue #42 (bug 1).
  //
  // The match key must be a true 4-element PREFIX. `queryKeys.search` always
  // emits a 5-element tuple `[..., page]`; with page omitted the trailing slot
  // is `undefined`, which React Query's partial matcher compares literally and
  // would fail against a real `page` value. Slicing off the page yields the
  // prefix that matches every page of the query.
  const searchPrefix = queryKeys.search(debouncedQuery, type, year).slice(0, 4);
  const isFetching = useIsFetching({ queryKey: searchPrefix }) > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setDebouncedQuery]);

  return (
    <div className="vhs-glow-phosphor relative flex items-center gap-3 border-2 border-[var(--vhs-phosphor)] bg-[var(--vhs-ground)] px-4 py-3 shadow-[5px_5px_0_rgba(0,0,0,0.8)]">
      {/* Terminal prompt glyph — decorative chrome. */}
      <span
        aria-hidden
        className="vhs-mono select-none text-[1.1rem] leading-none text-[var(--vhs-phosphor)]"
      >
        ▸
      </span>

      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <input
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="vhs-mono w-full flex-1 border-0 bg-transparent p-0 text-[0.95rem] text-[var(--vhs-cream)] placeholder:text-[var(--vhs-cream-dim)] focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden"
      />

      {isFetching && (
        <span
          role="status"
          aria-label="Loading"
          className="shrink-0"
        >
          {/* Reel/tape spinner — decorative; the status text above announces it. */}
          <span
            aria-hidden
            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--vhs-ground-3)] border-t-[var(--vhs-phosphor)] motion-reduce:animate-none"
          />
        </span>
      )}

      {query.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setDebouncedQuery("");
          }}
          className="vhs-kicker shrink-0 whitespace-nowrap border-0 bg-transparent px-1.5 py-1 text-[0.78rem] text-[var(--vhs-magenta)] hover:text-[var(--vhs-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--vhs-phosphor)]"
        >
          ✕ {clearLabel}
        </button>
      )}
    </div>
  );
}
