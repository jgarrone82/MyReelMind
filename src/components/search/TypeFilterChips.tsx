"use client";

import { useSearchFilters } from "@/stores/search-filters";
import type { SearchType } from "@/stores/search-filters";

interface TypeFilterChipsProps {
  dict: {
    all: string;
    movies: string;
    tv: string;
    anime: string;
  };
}

const TYPE_FILTERS: { key: SearchType; label: string }[] = [
  { key: "all", label: "all" },
  { key: "movie", label: "movies" },
  { key: "tv", label: "tv" },
  { key: "anime", label: "anime" },
];

export function TypeFilterChips({ dict }: TypeFilterChipsProps) {
  const { type, setType } = useSearchFilters();

  const getLabel = (key: SearchType): string => {
    switch (key) {
      case "all":
        return dict.all;
      case "movie":
        return dict.movies;
      case "tv":
        return dict.tv;
      case "anime":
        return dict.anime;
    }
  };

  return (
    <div
      className="flex flex-wrap gap-3"
      role="group"
      aria-label="Filter by type"
    >
      {TYPE_FILTERS.map((filter) => {
        const isActive = type === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => setType(filter.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setType(filter.key);
              }
            }}
            className={`vhs-kicker inline-flex items-center gap-2 border-2 border-[var(--vhs-ground)] px-3.5 py-1.5 text-[0.78rem] tracking-[0.14em] shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-transform duration-[90ms] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)] ${
              isActive
                ? "bg-[var(--vhs-magenta)] text-[var(--vhs-cream)]"
                : "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream-dim)] hover:text-[var(--vhs-cream)]"
            }`}
            aria-pressed={isActive}
            tabIndex={0}
          >
            {/* Channel LED — decorative tuner indicator, lit when active. */}
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                isActive
                  ? "bg-[var(--vhs-phosphor)] shadow-[0_0_6px_var(--vhs-phosphor)]"
                  : "bg-[var(--vhs-ground-3)]"
              }`}
            />
            {getLabel(filter.key)}
          </button>
        );
      })}
    </div>
  );
}
