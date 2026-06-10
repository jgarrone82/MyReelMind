import Link from "next/link";

interface TypeFilterChipsProps {
  lang: string;
  currentType: string | null;
  currentStatus: string | null;
  dict: {
    allTypes: string;
    filterMovie: string;
    filterTv: string;
    filterAnime: string;
  };
}

const TYPE_FILTERS = [
  { key: null, labelKey: "allTypes" as const },
  { key: "movie", labelKey: "filterMovie" as const },
  { key: "tv", labelKey: "filterTv" as const },
  { key: "anime", labelKey: "filterAnime" as const },
] as const;

function buildHref(
  lang: string,
  status: string | null,
  type: string | null
): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  const query = params.toString();
  return `/${lang}/library${query ? `?${query}` : ""}`;
}

export function TypeFilterChips({
  lang,
  currentType,
  currentStatus,
  dict,
}: TypeFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {TYPE_FILTERS.map((filter) => {
        const isActive = currentType === filter.key;
        return (
          <Link
            key={filter.key ?? "all"}
            href={buildHref(lang, currentStatus, filter.key)}
            aria-current={isActive ? "page" : undefined}
            className={`vhs-kicker inline-flex items-center gap-2 border-2 border-[var(--vhs-ground)] px-3.5 py-1.5 text-[0.78rem] tracking-[0.14em] shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-transform duration-[90ms] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)] ${
              isActive
                ? // WCAG AA (#48): deep-ink on neon magenta = 5.58:1; cream-on-magenta
                  // (2.98:1) failed for this small selected-chip label.
                  "bg-[var(--vhs-magenta)] text-[var(--vhs-ground)]"
                : "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream-dim)] hover:text-[var(--vhs-cream)]"
            }`}
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
            {dict[filter.labelKey]}
          </Link>
        );
      })}
    </div>
  );
}