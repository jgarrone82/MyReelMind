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
      <span className="text-sm text-gray-500">
        {totalItems} {dict.totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(lang, currentPage - 1, currentStatus, currentType)}
          aria-disabled={!hasPrevious}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            hasPrevious
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          {dict.previous}
        </Link>
        <span className="text-sm text-gray-500">
          {dict.page} {currentPage} / {totalPages}
        </span>
        <Link
          href={buildHref(lang, currentPage + 1, currentStatus, currentType)}
          aria-disabled={!hasNext}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            hasNext
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
        >
          {dict.next}
        </Link>
      </div>
    </div>
  );
}