import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ShelfRow } from "./ShelfRow";

describe("ShelfRow", () => {
  it("renders the kicker label", () => {
    render(
      <ShelfRow kicker="Recently watched">
        <div>card</div>
      </ShelfRow>,
    );
    expect(screen.getByText("Recently watched")).toBeInTheDocument();
  });

  it("renders the bracketed count when provided", () => {
    render(
      <ShelfRow kicker="Added this week" count={4}>
        <div>card</div>
      </ShelfRow>,
    );
    expect(screen.getByText("[4]")).toBeInTheDocument();
  });

  it("omits the count when not provided", () => {
    render(
      <ShelfRow kicker="No count">
        <div>card</div>
      </ShelfRow>,
    );
    expect(screen.queryByText(/^\[\d+\]$/)).not.toBeInTheDocument();
  });

  it("renders the marker note when provided", () => {
    render(
      <ShelfRow kicker="Recently watched" note="★ logged tonight">
        <div>card</div>
      </ShelfRow>,
    );
    expect(screen.getByText("★ logged tonight")).toBeInTheDocument();
  });

  it("renders a See all link with the given href and accessible name", () => {
    render(
      <ShelfRow
        kicker="Pick up where you left off"
        seeAllLabel="See all"
        seeAllHref="/library?status=watching"
      >
        <div>card</div>
      </ShelfRow>,
    );
    const link = screen.getByRole("link", { name: /see all/i });
    expect(link).toHaveAttribute("href", "/library?status=watching");
  });

  it("does not render a See all link when no href is provided", () => {
    render(
      <ShelfRow kicker="No link" seeAllLabel="See all">
        <div>card</div>
      </ShelfRow>,
    );
    expect(screen.queryByRole("link", { name: /see all/i })).not.toBeInTheDocument();
  });

  it("renders all children inside the track", () => {
    render(
      <ShelfRow kicker="Shelf">
        <div>card-1</div>
        <div>card-2</div>
        <div>card-3</div>
      </ShelfRow>,
    );
    expect(screen.getByText("card-1")).toBeInTheDocument();
    expect(screen.getByText("card-2")).toBeInTheDocument();
    expect(screen.getByText("card-3")).toBeInTheDocument();
  });

  it("exposes the kicker as the section's accessible name", () => {
    render(
      <ShelfRow kicker="Recently watched">
        <div>card</div>
      </ShelfRow>,
    );
    const region = screen.getByRole("region", { name: "Recently watched" });
    expect(within(region).getByText("card")).toBeInTheDocument();
  });
});
