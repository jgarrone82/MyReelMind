import { create } from "zustand";

export type SearchType = "all" | "movie" | "tv" | "anime";

interface SearchFiltersState {
  query: string;
  debouncedQuery: string;
  type: SearchType;
  year: number | null;

  setQuery: (query: string) => void;
  setDebouncedQuery: (query: string) => void;
  setType: (type: SearchType) => void;
  setYear: (year: number | null) => void;
  reset: () => void;
}

const initialState = {
  query: "",
  debouncedQuery: "",
  type: "all" as SearchType,
  year: null as number | null,
};

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  ...initialState,

  setQuery: (query) => set({ query }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery }),
  setType: (type) => set({ type }),
  setYear: (year) => set({ year }),
  reset: () => set(initialState),
}));
