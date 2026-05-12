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
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
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
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-pressed={isActive}
            tabIndex={0}
          >
            {getLabel(filter.key)}
          </button>
        );
      })}
    </div>
  );
}
