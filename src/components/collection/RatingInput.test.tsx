import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingInput } from "./RatingInput";

describe("RatingInput", () => {
  it("should render with no rating selected", () => {
    render(<RatingInput rating={null} onChange={() => {}} />);

    expect(screen.getByText(/not rated/i)).toBeInTheDocument();
  });

  it("should render current rating", () => {
    render(<RatingInput rating={8} onChange={() => {}} />);

    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("should call onChange when user clicks a rating button", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<RatingInput rating={null} onChange={handleChange} />);

    const button5 = screen.getByRole("button", { name: /rate 5/i });
    await user.click(button5);

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("should call onChange with null when clear is clicked", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<RatingInput rating={7} onChange={handleChange} />);

    const clearButton = screen.getByRole("button", { name: /clear rating/i });
    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<RatingInput rating={5} onChange={() => {}} disabled />);

    expect(screen.getByRole("button", { name: "Rate 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Clear rating" })).toBeDisabled();
  });

  it("should have 10 rating buttons", () => {
    render(<RatingInput rating={null} onChange={() => {}} />);

    const buttons = screen.getAllByRole("button").filter(
      (b) => b.getAttribute("aria-label")?.startsWith("Rate")
    );
    expect(buttons).toHaveLength(10);
  });

  it("should highlight selected rating", () => {
    render(<RatingInput rating={7} onChange={() => {}} />);

    const selectedButton = screen.getByRole("button", { name: /rate 7/i });
    expect(selectedButton.getAttribute("aria-pressed")).toBe("true");
  });

  // VHS restyle (R22/S7): the 1-10 toggle buttons keep their a11y contract
  // (role=group wrapper, per-button aria-label + aria-pressed, ~44px touch
  // targets) and adopt the VHS toggle look. The active button MUST use the
  // #48 AA pairing (deep-ink on magenta), NOT cream-on-magenta. The focus ring
  // follows the R4 phosphor + ground-offset convention.
  describe("VHS treatment (R22/S7)", () => {
    it("wraps the 1-10 buttons in a role=group", () => {
      render(<RatingInput rating={null} onChange={() => {}} />);

      expect(
        screen.getByRole("group", { name: /rating selection/i })
      ).toBeInTheDocument();
    });

    it("keeps aria-pressed and aria-label on every rating button", () => {
      render(<RatingInput rating={3} onChange={() => {}} />);

      for (let value = 1; value <= 10; value++) {
        const button = screen.getByRole("button", { name: `Rate ${value}` });
        expect(button).toHaveAttribute("aria-pressed", String(value === 3));
      }
    });

    it("keeps ~44px touch targets on the rating buttons", () => {
      render(<RatingInput rating={null} onChange={() => {}} />);

      const button = screen.getByRole("button", { name: "Rate 1" });
      expect(button.className).toMatch(/min-h-\[44px\]/);
      expect(button.className).toMatch(/min-w-\[44px\]/);
    });

    it("uses deep-ink-on-magenta (R3 AA) for the active button, not cream-on-magenta", () => {
      render(<RatingInput rating={7} onChange={() => {}} />);

      const active = screen.getByRole("button", { name: "Rate 7" });
      expect(active.className).toContain("bg-[var(--vhs-magenta)]");
      expect(active.className).toContain("text-[var(--vhs-ground)]");
      // R3: cream/cream-dim on magenta (2.98:1) is forbidden for active state.
      expect(active.className).not.toContain("text-[var(--vhs-cream)]");
      expect(active.className).not.toContain("text-[var(--vhs-cream-dim)]");
    });

    it("uses the R4 phosphor focus-ring convention on the rating buttons", () => {
      render(<RatingInput rating={null} onChange={() => {}} />);

      const button = screen.getByRole("button", { name: "Rate 1" });
      expect(button.className).toContain("focus-visible:outline-none");
      expect(button.className).toContain(
        "focus-visible:ring-[var(--vhs-phosphor)]"
      );
      expect(button.className).toContain(
        "focus-visible:ring-offset-[var(--vhs-ground)]"
      );
    });

    it("drops the shadcn bg-muted/bg-accent chrome from inactive buttons", () => {
      render(<RatingInput rating={null} onChange={() => {}} />);

      const button = screen.getByRole("button", { name: "Rate 1" });
      expect(button.className).not.toMatch(/bg-muted/);
      expect(button.className).not.toMatch(/bg-accent/);
    });
  });
});
