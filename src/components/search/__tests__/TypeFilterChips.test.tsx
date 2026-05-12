import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypeFilterChips } from "../TypeFilterChips";
import { useSearchFilters } from "@/stores/search-filters";

describe("TypeFilterChips", () => {
  const defaultDict = {
    all: "All",
    movies: "Movies",
    tv: "TV Shows",
    anime: "Anime",
  };

  beforeEach(() => {
    useSearchFilters.setState({
      query: "",
      debouncedQuery: "",
      type: "all",
      year: null,
      page: 1,
    });
  });

  it("should render all filter chips", () => {
    render(<TypeFilterChips dict={defaultDict} />);

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Movies")).toBeInTheDocument();
    expect(screen.getByText("TV Shows")).toBeInTheDocument();
    expect(screen.getByText("Anime")).toBeInTheDocument();
  });

  it("should set All as active by default", () => {
    render(<TypeFilterChips dict={defaultDict} />);

    const allChip = screen.getByText("All");
    expect(allChip).toHaveAttribute("aria-pressed", "true");
  });

  it("should call setType when a chip is clicked", async () => {
    const user = userEvent.setup();
    render(<TypeFilterChips dict={defaultDict} />);

    await user.click(screen.getByText("Movies"));

    expect(useSearchFilters.getState().type).toBe("movie");
  });

  it("should call setType when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<TypeFilterChips dict={defaultDict} />);

    const animeChip = screen.getByText("Anime");
    animeChip.focus();
    await user.keyboard("{Enter}");

    expect(useSearchFilters.getState().type).toBe("anime");
  });

  it("should call setType when Space key is pressed", async () => {
    const user = userEvent.setup();
    render(<TypeFilterChips dict={defaultDict} />);

    const tvChip = screen.getByText("TV Shows");
    tvChip.focus();
    await user.keyboard(" ");

    expect(useSearchFilters.getState().type).toBe("tv");
  });

  it("should reset page to 1 when type changes", async () => {
    const user = userEvent.setup();
    useSearchFilters.setState({ page: 3 });
    render(<TypeFilterChips dict={defaultDict} />);

    await user.click(screen.getByText("Movies"));

    expect(useSearchFilters.getState().page).toBe(1);
  });

  it("should reflect active state from store", () => {
    useSearchFilters.setState({ type: "anime" });
    render(<TypeFilterChips dict={defaultDict} />);

    const animeChip = screen.getByText("Anime");
    expect(animeChip).toHaveAttribute("aria-pressed", "true");

    const allChip = screen.getByText("All");
    expect(allChip).toHaveAttribute("aria-pressed", "false");
  });
});
