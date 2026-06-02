"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { VHSBoxCard } from "@/components/vhs";
import { mediaItemToCardProps } from "@/lib/media/vhs-cosmetics";
import { useDictionary } from "@/i18n/provider";
import type { MediaItem } from "@/lib/api/merge";

interface SearchResultsProps {
  lang?: string;
}

/** A grid of VHS box cards laid out on the directory shelf. */
function ResultsShelf({ items, lang }: { items: MediaItem[]; lang?: string }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <VHSBoxCard key={item.id} {...mediaItemToCardProps(item, lang ?? "en")} />
      ))}
    </div>
  );
}

export function SearchResults({ lang }: SearchResultsProps) {
  const dict = useDictionary();
  const { debouncedQuery, type, year, page, setPage } = useSearchFilters();
  const { data, isLoading, isError, refetch } = useSearch(
    debouncedQuery,
    type,
    year,
    page
  );
  const [allResults, setAllResults] = useState<MediaItem[]>([]);
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
  const t = dict.search;

  // Empty-query state: the honest "type to search" prompt, dressed in VHS voice.
  if (!debouncedQuery.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span
          aria-hidden
          className="vhs-mono mb-3 text-2xl leading-none text-[var(--vhs-phosphor)]"
        >
          ▸_
        </span>
        <p className="vhs-display text-[1.4rem] text-[var(--vhs-cream)]">
          {t.searchPrompt}
        </p>
        <p className="vhs-mono mt-2 text-[0.8rem] text-[var(--vhs-cream-dim)]">
          {t.searchPromptHint}
        </p>
      </div>
    );
  }

  // Error state: surface the data-layer error with a retry. NET-NEW thin wiring.
  if (isError) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="mx-auto mt-2 max-w-xl border-2 border-[var(--vhs-ground)] bg-[var(--vhs-error)] px-4 py-4 text-[var(--vhs-cream)] shadow-[6px_6px_0_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="vhs-display text-2xl leading-none"
          >
            ⚠
          </span>
          <div className="flex-1">
            <div className="vhs-kicker text-[0.92rem] tracking-[0.16em]">
              {t.errorHead}
            </div>
            <p className="vhs-mono mt-1 text-[0.85rem] leading-relaxed">
              {t.errorBody}
            </p>
            <button
              type="button"
              onClick={() => {
                refetch();
                document.getElementById("search-input")?.focus();
              }}
              className="vhs-btn vhs-btn--secondary mt-3.5 text-[0.82rem]"
            >
              ↻ {t.errorRetry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state (first page only): tape skeletons.
  if (isLoading && !hasResults) {
    return (
      <div>
        <div
          role="status"
          aria-live="polite"
          className="vhs-mono mb-5 flex items-center gap-2.5 text-[0.85rem] tracking-[0.16em] text-[var(--vhs-phosphor)]"
        >
          <span
            aria-hidden
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--vhs-ground-3)] border-t-[var(--vhs-phosphor)]"
          />
          {t.typing}
        </div>
        <div
          aria-hidden
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="tape-skeleton">
              <div className="sk-strip" />
              <div className="sk-poster" />
              <div className="sk-foot" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Out-of-stock state: query present but no results. Distinct from the prompt.
  if (!hasResults) {
    return (
      <div
        aria-live="polite"
        className="flex flex-col items-center gap-6 py-10 text-center"
      >
        <div className="relative w-[min(220px,60vw)]">
          <div
            aria-hidden
            className="grid aspect-[2/3] w-full place-items-center border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] shadow-[8px_8px_0_rgba(0,0,0,0.8)]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 28px)",
            }}
          >
            <span className="vhs-kicker rotate-[-90deg] text-[1rem] tracking-[0.2em] text-[var(--vhs-ground-3)]">
              NO TAPE
            </span>
          </div>
          <div className="absolute left-1/2 top-[40%] w-max max-w-[90%] -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-magenta)] px-5 py-3 text-center text-[var(--vhs-cream)] shadow-[4px_4px_0_var(--vhs-ground)]">
            <div className="vhs-display text-[1.5rem] leading-none">
              {t.zeroHead}
            </div>
          </div>
        </div>
        <p className="vhs-mono max-w-md text-[0.9rem] text-[var(--vhs-cream-dim)]">
          {t.zeroSub}
        </p>
      </div>
    );
  }

  // Results: receipt header + VHS box-card grid + Load More.
  const showLoadMore = hasResults && data && page < data.totalPages;
  const [headBefore, headAfter] = t.resultsHead.split("{n}");

  return (
    <div className="space-y-6">
      <div>
        <div
          aria-live="polite"
          className="vhs-mono flex flex-wrap items-baseline gap-2 text-[0.95rem] tracking-[0.06em] text-[var(--vhs-cream)]"
        >
          <span aria-hidden className="text-[var(--vhs-phosphor)]">
            ▸
          </span>
          <span>
            {headBefore}
            {allResults.length}
            {headAfter}
          </span>
          <span className="vhs-display text-[1.15rem] text-[var(--vhs-acid)]">
            &lsquo;{debouncedQuery.toUpperCase()}&rsquo;
          </span>
        </div>
        <div className="mt-2 border-b-2 border-dashed border-[var(--vhs-cream-dim)]" />
        <div className="vhs-mono mt-2 text-[0.7rem] tracking-[0.05em] text-[var(--vhs-cream-dim)]">
          {t.resultsSub}
        </div>
      </div>

      <ResultsShelf items={allResults} lang={lang} />

      {showLoadMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={isLoading}
            className="vhs-btn vhs-btn--secondary disabled:opacity-50"
          >
            {isLoading ? t.loadingMore : t.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}
