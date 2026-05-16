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

  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-muted-foreground">
        {totalItems} {dict.totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(lang, currentPage - 1, currentStatus, currentType)}
          tabIndex={hasPrevious ? undefined : -1}
          aria-disabled={!hasPrevious}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            hasPrevious
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-muted text-muted-foreground pointer-events-none"
          }`}
        >
          {dict.previous}
        </Link>
<span className="text-sm text-muted-foreground">
          {dict.page} {currentPage} / {totalPages}
        </span>
        <Link
          href={buildHref(lang, currentPage + 1, currentStatus, currentType)}
          tabIndex={hasNext ? undefined : -1}
          aria-disabled={!hasNext}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
            hasNext
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-muted text-muted-foreground pointer-events-none"
          }`}
        >
          {dict.next}
        </Link>
      </div>
    </div>
  );
}