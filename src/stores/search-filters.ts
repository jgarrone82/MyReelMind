import { create } from "zustand";

export type SearchType = "all" | "movie" | "tv" | "anime";

interface SearchFiltersState {
  query: string;
  debouncedQuery: string;
  type: SearchType;
  year: number | null;
  page: number;

  setQuery: (query: string) => void;
  setDebouncedQuery: (query: string) => void;
  setType: (type: SearchType) => void;
  setYear: (year: number | null) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const initialState = {
  query: "",
  debouncedQuery: "",
  type: "all" as SearchType,
  year: null as number | null,
  page: 1,
};

export const useSearchFilters = create<SearchFiltersState>((set) => ({
  ...initialState,

  setQuery: (query) => set({ query }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery, page: 1 }),
  setType: (type) => set({ type, page: 1 }),
  setYear: (year) => set({ year }),
  setPage: (page) => set({ page }),
  reset: () => set(initialState),
}));
