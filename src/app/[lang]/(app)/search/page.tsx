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
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Store-directory kicker + display heading, mirroring login/signup. */}
        <div className="mb-2">
          <p className="vhs-kicker text-[0.8rem] tracking-[0.16em] text-[var(--vhs-phosphor)]">
            {dict.search.kicker}
          </p>
          <h1 className="vhs-display vhs-aberrate mt-1 text-[clamp(2rem,5vw,3rem)] text-[var(--vhs-cream)]">
            {dict.search.lookupTitle}
          </h1>
        </div>

        <div className="mt-6">
          <SearchBar
            placeholder={dict.search.placeholder}
            clearLabel={dict.search.clear}
          />
        </div>

        <div className="mt-5">
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
          {/* SearchResults is a client component using React Query's
              useQuery (non-suspense), so it never throws a promise. A
              Suspense boundary here would be dead code; the component renders
              its own TapeSkeleton loading state instead. */}
          <SearchResults lang={lang} />
        </div>
      </div>
    </main>
  );
}
