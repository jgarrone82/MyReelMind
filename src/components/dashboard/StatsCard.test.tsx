import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "./StatsCard";

describe("StatsCard", () => {
  it("should render label and value", () => {
    render(<StatsCard label="Total Watched" value={42} />);

    expect(screen.getByText("Total Watched")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should apply size variant classes to the value", () => {
    render(
      <StatsCard label="Hours" value={100} size="large" />
    );

    expect(screen.getByText("100")).toHaveClass("text-3xl");
  });

  it("should render with default size on value", () => {
    render(
      <StatsCard label="Test" value={1} />
    );

    expect(screen.getByText("1")).toHaveClass("text-2xl");
  });
});