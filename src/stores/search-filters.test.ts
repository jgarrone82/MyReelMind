import { describe, it, expect } from "vitest";
import { useSearchFilters } from "./search-filters";

describe("useSearchFilters", () => {
  it("should have default state", () => {
    const state = useSearchFilters.getState();
    expect(state.query).toBe("");
    expect(state.type).toBe("all");
    expect(state.year).toBeNull();
    expect(state.debouncedQuery).toBe("");
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
    const { setQuery, setType, setYear, setDebouncedQuery, reset } = useSearchFilters.getState();
    setQuery("test");
    setType("movie");
    setYear(2020);
    setDebouncedQuery("test");
    reset();

    const state = useSearchFilters.getState();
    expect(state.query).toBe("");
    expect(state.type).toBe("all");
    expect(state.year).toBeNull();
    expect(state.debouncedQuery).toBe("");
  });
});
