"use client";

import { useEffect } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";

interface SearchBarProps {
  placeholder: string;
  /** Label for the CLEAR control shown while the query is non-empty. */
  clearLabel?: string;
}

export function SearchBar({ placeholder, clearLabel = "Clear" }: SearchBarProps) {
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
        role="searchbox"
        aria-label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="vhs-mono w-full flex-1 border-0 bg-transparent p-0 text-[0.95rem] tracking-[0.04em] text-[var(--vhs-cream)] placeholder:text-[var(--vhs-cream-dim)] focus:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden"
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
          className="vhs-kicker shrink-0 whitespace-nowrap border-0 bg-transparent px-1.5 py-1 text-[0.78rem] tracking-[0.14em] text-[var(--vhs-magenta)] hover:text-[var(--vhs-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--vhs-phosphor)]"
        >
          ✕ {clearLabel}
        </button>
      )}
    </div>
  );
}
