"use client";

import { Suspense } from "react";
import { use } from "react";
import { SearchBar } from "@/components/media/SearchBar";
import { MediaGrid } from "@/components/media/MediaGrid";
import { SearchResults } from "./SearchResults";

interface SearchPageProps {
  params: Promise<{ lang: string }>;
}

export default function SearchPage({ params }: SearchPageProps) {
  const { lang } = use(params);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{lang === "es" ? "Buscar" : "Search"}</h1>
      <SearchBar />
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
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}
