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
    <div className="flex flex-wrap gap-2">
      {TYPE_FILTERS.map((filter) => {
        const isActive = currentType === filter.key;
        return (
          <Link
            key={filter.key ?? "all"}
            href={buildHref(lang, currentStatus, filter.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {dict[filter.labelKey]}
          </Link>
        );
      })}
    </div>
  );
}