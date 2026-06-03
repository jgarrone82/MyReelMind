"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { useTrending } from "@/hooks/queries/useTrending";
import { VHSBoxCard } from "@/components/vhs";
import { TapeSkeleton } from "@/components/search/TapeSkeleton";
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
  const { data, isLoading, isFetching, isError, refetch } = useSearch(
    debouncedQuery,
    type,
    year,
    page
  );

  // NOW SHOWING trending shelf for the empty-query state. Called
  // unconditionally (rules of hooks) before any early return; only the fetch is
  // gated. With no active query it fetches (and a 1h staleTime keeps re-renders
  // free); once a query is active the fetch is disabled so we never hit
  // /api/trending behind an unused shelf. Only consumed in the empty-query
  // branch below.
  const hasActiveQuery = Boolean(debouncedQuery.trim());
  const { data: trendingData, isLoading: isTrendingLoading } = useTrending({
    enabled: !hasActiveQuery,
  });

  // Order-safe accumulation: results are keyed by their page index instead of
  // blind replace/append. This makes accumulation idempotent and independent of
  // network arrival order — a late or reordered page response always lands in
  // its own slot rather than wiping (page 1) or duplicating (page N) the list.
  // The displayed list is derived by walking pages in ascending order and
  // deduping by media id, preserving page order. See issue #42 (bug 3).
  const [resultsByPage, setResultsByPage] = useState<Map<number, MediaItem[]>>(
    () => new Map()
  );
  // Last SETTLED totalPages for the current query identity. Reading totalPages
  // straight off `data` flips the Load More button on/off mid-revalidation,
  // when `data.totalPages` can be a stale/transitional value. Capturing it only
  // when the query has settled (`!isFetching`) keeps the button honest and
  // stable (issue #42 bug 2).
  const [settledTotalPages, setSettledTotalPages] = useState<number | null>(
    null
  );
  // A distinct result set is defined by the query + active filters. When that
  // identity changes the accumulation must reset so stale pages from a
  // superseded query never bleed into the new results (bug 3 companion).
  const queryIdentity = `${debouncedQuery}::${type}::${year ?? ""}`;
  const prevIdentityRef = useRef(queryIdentity);

  // Follow-up (low impact, pre-existing): the reset runs in an effect, so a
  // query/type/year change leaves one transitional render showing the previous
  // identity's state before the reset commits. Deriving the reset during render
  // (compare-previous-identity pattern) would eliminate that frame.
  useEffect(() => {
    if (queryIdentity !== prevIdentityRef.current) {
      prevIdentityRef.current = queryIdentity;
      setResultsByPage(new Map());
      setSettledTotalPages(null);
    }
  }, [queryIdentity]);

  // Store each settled page's results in its own slot. Re-delivery of the same
  // page overwrites that slot (no duplicate append); out-of-order delivery is
  // harmless because the slot, not arrival order, determines position.
  useEffect(() => {
    if (data && data.results.length > 0) {
      setResultsByPage((prev) => {
        const next = new Map(prev);
        next.set(page, data.results);
        return next;
      });
    }
  }, [data, page]);

  // Capture totalPages only from a settled (not in-flight) response.
  useEffect(() => {
    if (!isFetching && data) {
      setSettledTotalPages(data.totalPages);
    }
  }, [isFetching, data]);

  const allResults = useMemo(() => {
    const seen = new Set<string>();
    const flattened: MediaItem[] = [];
    for (const pageIndex of [...resultsByPage.keys()].sort((a, b) => a - b)) {
      for (const item of resultsByPage.get(pageIndex) ?? []) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        flattened.push(item);
      }
    }
    return flattened;
  }, [resultsByPage]);

  const hasResults = allResults.length > 0;
  const t = dict.search;

  // Empty-query state: the NOW SHOWING trending shelf, with honest degradation.
  if (!debouncedQuery.trim()) {
    // Loading: reuse the same tape skeleton search uses. No flash of the prompt.
    if (isTrendingLoading) {
      return <TapeSkeleton />;
    }

    // Success: real trending items only, under the localized NOW SHOWING heading.
    const trendingItems = trendingData?.results ?? [];
    if (trendingItems.length > 0) {
      return (
        <div className="space-y-6">
          <h2 className="vhs-display text-[1.4rem] text-[var(--vhs-cream)]">
            {t.nowShowingHead}
          </h2>
          <ResultsShelf items={trendingItems} lang={lang} />
        </div>
      );
    }

    // Total failure / empty: degrade to the existing honest "type to search"
    // prompt, dressed in VHS voice. Never an empty grid, never fabricated tiles.
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

  // First-load error: nothing on screen yet, so surface the FULL-SCREEN error
  // panel with a retry. NET-NEW thin wiring.
  if (isError && !hasResults) {
    return (
      <div
        role="alert"
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
              onClick={() => refetch()}
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
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--vhs-ground-3)] border-t-[var(--vhs-phosphor)] motion-reduce:animate-none"
          />
          {t.typing}
        </div>
        <TapeSkeleton />
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
          <div className="absolute left-1/2 top-[40%] w-max max-w-[90%] -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-magenta)] px-5 py-3 text-center text-[var(--vhs-ground)] shadow-[4px_4px_0_var(--vhs-ground)]">
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
  // Base the button on the last SETTLED totalPages, never on the transitional
  // value `data` carries mid-revalidation — that would flip it on/off during a
  // page transition (issue #42 bug 2).
  const showLoadMore =
    !isError &&
    hasResults &&
    settledTotalPages !== null &&
    page < settledTotalPages;
  // Singular grammar: "Found 1 result" instead of "Found 1 results".
  const headTemplate =
    allResults.length === 1 ? t.resultsHeadOne : t.resultsHead;
  // Safe {n} interpolation: a translation missing the placeholder must not
  // silently drop the count — fall back to empty strings around it.
  const headParts = headTemplate.split("{n}");
  const headBefore = headParts[0] ?? "";
  const headAfter = headParts[1] ?? "";

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

      {/* Load-More failure: keep the on-screen results, surface a NON-destructive
          inline error + retry instead of replacing the grid. */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-2 text-center"
        >
          <p className="vhs-mono text-[0.8rem] text-[var(--vhs-error)]">
            {t.errorBody}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="vhs-btn vhs-btn--secondary text-[0.82rem]"
          >
            ↻ {t.errorRetry}
          </button>
        </div>
      )}

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
