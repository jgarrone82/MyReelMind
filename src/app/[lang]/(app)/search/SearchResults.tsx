"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchFilters } from "@/stores/search-filters";
import { useSearch } from "@/hooks/queries/useSearch";
import { useTrending } from "@/hooks/queries/useTrending";
import { useLibraryState } from "@/hooks/queries/useLibraryState";
import { useAuthUserId } from "@/hooks/useAuthUserId";
import { VHSBoxCard } from "@/components/vhs";
import type { GenreStickerHue, VHSBoxCardProps } from "@/components/vhs";
import { TapeSkeleton } from "@/components/search/TapeSkeleton";
import { mediaItemToCardProps } from "@/lib/media/vhs-cosmetics";
import { useDictionary } from "@/i18n/provider";
import type { MediaItem } from "@/lib/api/merge";
import type { LibraryBadgeState } from "@/lib/dashboard/library-state";

interface SearchResultsProps {
  lang?: string;
}

/**
 * Design D4 state→hue map. All three neon hues paint deep-ink text and are
 * WCAG-AA verified (issue #45). `add` is the logged-in call-to-action.
 */
const STATE_BADGE_HUE: Record<LibraryBadgeState, GenreStickerHue> = {
  in_library: "phosphor",
  in_progress: "sodium",
  add: "magenta",
};

/** i18n labels keyed by badge state. */
type BadgeLabels = Record<LibraryBadgeState, string>;

/** Per-card badge prop, or undefined when no badge should render. */
type CardBadge = VHSBoxCardProps["badge"];

/**
 * Resolve a single result's badge from the (read-only) library-state Map.
 *
 * Honest-data: a logged-out user has no `userId`, so the shelf passes
 * `libraryState = null` and EVERY result resolves to `undefined` (no badge) —
 * byte-for-byte the pre-change output. When logged in, an id absent from the
 * Map means ADD (the default for a tracked-but-not-owned result).
 */
function badgeForItem(
  item: MediaItem,
  libraryState: ReadonlyMap<string, LibraryBadgeState> | null,
  labels: BadgeLabels
): CardBadge {
  if (!libraryState) return undefined;
  const state = libraryState.get(item.id) ?? "add";
  return { label: labels[state], color: STATE_BADGE_HUE[state] };
}

/**
 * A grid of VHS box cards laid out on the directory shelf.
 *
 * `libraryState` is supplied only for the search-results shelf (logged-in);
 * the trending/NOW-SHOWING shelf passes `null` so it never renders badges
 * (badges are a search-results affordance only — design D7).
 */
function ResultsShelf({
  items,
  lang,
  libraryState,
  badgeLabels,
}: {
  items: MediaItem[];
  lang?: string;
  libraryState: ReadonlyMap<string, LibraryBadgeState> | null;
  badgeLabels: BadgeLabels;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <VHSBoxCard
          key={item.id}
          {...mediaItemToCardProps(
            item,
            lang ?? "en",
            badgeForItem(item, libraryState, badgeLabels)
          )}
        />
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

  // Library-state badge enrichment (#42 Group D). Both hooks are called
  // UNCONDITIONALLY (rules of hooks) and gate to a no-op when logged-out/empty:
  // `useAuthUserId` returns null when logged out, and `useLibraryState` is
  // enabled only when there is a userId AND at least one id — so a logged-out
  // user or a zero-result page never issues a request. A SINGLE shelf-level call
  // enriches the whole page (no per-card fetch). The id list is derived from the
  // accumulated results, so Load More pages resolve their own badges too.
  const userId = useAuthUserId();
  const resultIds = useMemo(
    () => allResults.map((item) => item.id),
    [allResults]
  );
  const { data: libraryState, isSuccess: libraryStateReady } = useLibraryState(
    resultIds,
    userId
  );

  const hasResults = allResults.length > 0;
  const t = dict.search;

  // Badge labels resolved once from the dictionary; shared by every card.
  const badgeLabels: BadgeLabels = {
    add: t.badge.add,
    in_library: t.badge.inLibrary,
    in_progress: t.badge.inProgress,
  };

  // Logged-out → no userId → pass `null` so the shelf renders NO badges
  // (identical to pre-change behavior). Logged-in → only pass the Map once the
  // library-state query has SETTLED successfully (`libraryStateReady`).
  //
  // The settled-gate is what prevents the ADD-badge flash. `useLibraryState` has
  // NO placeholderData, so `isSuccess` flips true ONLY after a real successful
  // response; while the query is pending it returns a stable EMPTY Map but
  // reports `isSuccess === false`. A bare `userId ? libraryState : null` would
  // feed that empty Map to `badgeForItem`, and `libraryState.get(id) ?? "add"`
  // would flash ADD on EVERY card — including items that are actually
  // IN_LIBRARY / IN_PROGRESS — for one network round-trip. Gating on the honest
  // `isSuccess` keeps it null until the real state resolves, so badges appear a
  // beat later instead of flashing wrong (design D7 / honest-data).
  const searchLibraryState = userId && libraryStateReady ? libraryState : null;

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
          {/* Trending shelf never shows library badges (design D7): pass null. */}
          <ResultsShelf
            items={trendingItems}
            lang={lang}
            libraryState={null}
            badgeLabels={badgeLabels}
          />
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

      <ResultsShelf
        items={allResults}
        lang={lang}
        libraryState={searchLibraryState}
        badgeLabels={badgeLabels}
      />

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
