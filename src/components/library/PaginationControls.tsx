import Link from "next/link";

interface PaginationControlsProps {
  lang: string;
  currentPage: number;
  totalPages: number;
  currentStatus: string | null;
  currentType: string | null;
  totalItems: number;
  dict: {
    previous: string;
    next: string;
    page: string;
    totalItems: string;
  };
}

function buildHref(
  lang: string,
  page: number,
  status: string | null,
  type: string | null
): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  params.set("page", String(page));
  return `/${lang}/library?${params.toString()}`;
}

export function PaginationControls({
  lang,
  currentPage,
  totalPages,
  currentStatus,
  currentType,
  totalItems,
  dict,
}: PaginationControlsProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const controlBase =
    "vhs-kicker inline-flex items-center border-2 border-[var(--vhs-ground)] px-3.5 py-1.5 text-[0.78rem] tracking-[0.14em] shadow-[2px_2px_0_rgba(0,0,0,0.8)] transition-transform duration-[90ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]";
  const controlEnabled =
    "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream)] hover:-translate-y-0.5";
  const controlDisabled =
    "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream-dim)] opacity-50 pointer-events-none";

  return (
    <div className="flex items-center justify-between py-4">
      <span className="vhs-mono text-sm text-[var(--vhs-cream-dim)]">
        {totalItems} {dict.totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(lang, currentPage - 1, currentStatus, currentType)}
          tabIndex={hasPrevious ? undefined : -1}
          aria-disabled={!hasPrevious}
          className={`${controlBase} ${hasPrevious ? controlEnabled : controlDisabled}`}
        >
          {dict.previous}
        </Link>
        <span className="vhs-mono text-sm text-[var(--vhs-cream-dim)]">
          {dict.page} {currentPage} / {totalPages}
        </span>
        <Link
          href={buildHref(lang, currentPage + 1, currentStatus, currentType)}
          tabIndex={hasNext ? undefined : -1}
          aria-disabled={!hasNext}
          className={`${controlBase} ${hasNext ? controlEnabled : controlDisabled}`}
        >
          {dict.next}
        </Link>
      </div>
    </div>
  );
}