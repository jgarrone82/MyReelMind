import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TapeSkeleton } from "../TapeSkeleton";

describe("TapeSkeleton", () => {
  it("renders a decorative, aria-hidden grid", () => {
    const { container } = render(<TapeSkeleton />);

    const grid = container.querySelector('[aria-hidden="true"]');
    expect(grid).not.toBeNull();
    // The placeholder shelf must never be announced to assistive tech.
    expect(container.querySelector(".tape-skeleton")).not.toBeNull();
  });

  it("renders the requested number of placeholder tapes (default 10)", () => {
    const { container } = render(<TapeSkeleton />);
    expect(container.querySelectorAll(".tape-skeleton")).toHaveLength(10);
  });

  it("honours a custom count", () => {
    const { container } = render(<TapeSkeleton count={3} />);
    expect(container.querySelectorAll(".tape-skeleton")).toHaveLength(3);
  });
});
