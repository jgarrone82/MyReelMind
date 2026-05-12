import { Suspense } from "react";
import { SearchBar } from "@/components/media/SearchBar";
import { TypeFilterChips } from "@/components/search/TypeFilterChips";
import { SearchResults } from "./SearchResults";
import { getDictionary, type Locale } from "@/i18n";

interface SearchPageProps {
  params: Promise<{ lang: string }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{dict.search.title}</h1>
      <SearchBar />
      <div className="mt-4">
        <TypeFilterChips
          dict={{
            all: dict.search.all,
            movies: dict.search.movies,
            tv: dict.search.tv,
            anime: dict.search.anime,
          }}
        />
      </div>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          }
        >
          <SearchResults lang={lang} />
        </Suspense>
      </div>
    </main>
  );
}
