import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaginationControls } from "@/components/library/PaginationControls";

const baseProps = {
  lang: "en" as const,
  currentPage: 2,
  totalPages: 5,
  currentStatus: null,
  currentType: null,
  totalItems: 87,
  dict: {
    previous: "Previous",
    next: "Next",
    page: "Page",
    totalItems: "items",
  },
};

describe("PaginationControls", () => {
  it("should display total item count", () => {
    render(<PaginationControls {...baseProps} />);
    expect(screen.getByText("87 items")).toBeInTheDocument();
  });

  it("should display current page info", () => {
    render(<PaginationControls {...baseProps} />);
    expect(screen.getByText("Page 2 / 5")).toBeInTheDocument();
  });

  it("should have Previous enabled when not on page 1", () => {
    render(<PaginationControls {...baseProps} currentPage={2} />);
    const prevLink = screen.getByText("Previous").closest("a");
    expect(prevLink).not.toHaveClass("pointer-events-none");
    expect(prevLink?.getAttribute("href")).toBe("/en/library?page=1");
  });

  it("should have Previous disabled on page 1", () => {
    render(<PaginationControls {...baseProps} currentPage={1} />);
    const prevLink = screen.getByText("Previous").closest("a");
    expect(prevLink?.className).toContain("pointer-events-none");
  });

  it("should have Next enabled when more pages exist", () => {
    render(<PaginationControls {...baseProps} currentPage={2} totalPages={5} />);
    const nextLink = screen.getByText("Next").closest("a");
    expect(nextLink?.getAttribute("href")).toBe("/en/library?page=3");
  });

  it("should have Next disabled on last page", () => {
    render(<PaginationControls {...baseProps} currentPage={5} totalPages={5} />);
    const nextLink = screen.getByText("Next").closest("a");
    expect(nextLink?.className).toContain("pointer-events-none");
  });

  it("should preserve status and type params in links", () => {
    render(
      <PaginationControls
        {...baseProps}
        currentPage={2}
        currentStatus="watching"
        currentType="anime"
      />
    );
    const prevLink = screen.getByText("Previous").closest("a");
    expect(prevLink?.getAttribute("href")).toBe(
      "/en/library?status=watching&type=anime&page=1"
    );
  });
});