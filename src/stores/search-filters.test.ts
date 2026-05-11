import { describe, it, expect } from "vitest";
import { useSearchFilters } from "./search-filters";

describe("useSearchFilters", () => {
  it("should have default state", () => {
    const state = useSearchFilters.getState();
    expect(state.query).toBe("");
    expect(state.type).toBe("all");
    expect(state.year).toBeNull();
    expect(state.debouncedQuery).toBe("");
    expect(state.page).toBe(1);
  });

  it("should set query", () => {
    useSearchFilters.getState().setQuery("naruto");
    expect(useSearchFilters.getState().query).toBe("naruto");
  });

  it("should set type filter", () => {
    useSearchFilters.getState().setType("anime");
    expect(useSearchFilters.getState().type).toBe("anime");
  });

  it("should set year", () => {
    useSearchFilters.getState().setYear(2020);
    expect(useSearchFilters.getState().year).toBe(2020);
  });

  it("should clear year", () => {
    useSearchFilters.getState().setYear(2020);
    useSearchFilters.getState().setYear(null);
    expect(useSearchFilters.getState().year).toBeNull();
  });

  it("should set debounced query", () => {
    useSearchFilters.getState().setDebouncedQuery("naruto");
    expect(useSearchFilters.getState().debouncedQuery).toBe("naruto");
  });

  it("should reset filters", () => {
    const { setQuery, setType, setYear, setDebouncedQuery, setPage, reset } =
      useSearchFilters.getState();
    setQuery("test");
    setType("movie");
    setYear(2020);
    setDebouncedQuery("test");
    setPage(3);
    reset();

    const state = useSearchFilters.getState();
    expect(state.query).toBe("");
    expect(state.type).toBe("all");
    expect(state.year).toBeNull();
    expect(state.debouncedQuery).toBe("");
    expect(state.page).toBe(1);
  });

  it("should set page", () => {
    useSearchFilters.getState().setPage(2);
    expect(useSearchFilters.getState().page).toBe(2);
  });

  it("should reset page to 1 when debounced query changes", () => {
    useSearchFilters.getState().setPage(3);
    useSearchFilters.getState().setDebouncedQuery("new query");
    expect(useSearchFilters.getState().page).toBe(1);
  });

  it("should reset page to 1 when type changes", () => {
    useSearchFilters.getState().setPage(2);
    useSearchFilters.getState().setType("anime");
    expect(useSearchFilters.getState().page).toBe(1);
  });

  it("should reset page to 1 when year changes", () => {
    useSearchFilters.getState().setPage(2);
    useSearchFilters.getState().setYear(2020);
    expect(useSearchFilters.getState().page).toBe(1);
  });
});
