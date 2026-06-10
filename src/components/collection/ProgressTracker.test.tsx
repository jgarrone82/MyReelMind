import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressTracker } from "./ProgressTracker";

describe("ProgressTracker", () => {
  it("should render current progress", () => {
    render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

    expect(screen.getByText(/episode 5 of 12/i)).toBeInTheDocument();
  });

  it("should render without total", () => {
    render(<ProgressTracker progress={3} total={null} onChange={() => {}} />);

    expect(screen.getByText(/episode 3/i)).toBeInTheDocument();
    expect(screen.queryByText(/of/i)).not.toBeInTheDocument();
  });

  it("should call onChange when user inputs progress", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ProgressTracker progress={0} total={12} onChange={handleChange} />);

    const input = screen.getByRole("spinbutton", { name: /progress/i });
    await user.clear(input);
    await user.type(input, "5");

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("should enforce min value of 0", () => {
    render(<ProgressTracker progress={0} total={12} onChange={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: /progress/i });
    expect(input).toHaveAttribute("min", "0");
  });

  it("should enforce max value when total is known", () => {
    render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: /progress/i });
    expect(input).toHaveAttribute("max", "12");
  });

  it("should not have max when total is null", () => {
    render(<ProgressTracker progress={5} total={null} onChange={() => {}} />);

    const input = screen.getByRole("spinbutton", { name: /progress/i });
    expect(input).not.toHaveAttribute("max");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<ProgressTracker progress={5} total={12} onChange={() => {}} disabled />);

    const input = screen.getByRole("spinbutton", { name: /progress/i });
    expect(input).toBeDisabled();
  });

  it("should use chapter label for manga type", () => {
    render(
      <ProgressTracker progress={10} total={50} onChange={() => {}} mediaType="manga" />
    );

    expect(screen.getByText(/chapter 10 of 50/i)).toBeInTheDocument();
  });

  // VHS restyle (R21/S8/S15): the number input adopts the shared .vhs-input
  // utility (composed with its w-24 width) and drops the shadcn field chrome,
  // while keeping its id, spinbutton role, aria-label, and min/max bounds.
  describe("VHS treatment (R21/S8/S15)", () => {
    it("adopts the shared .vhs-input utility on the number input", () => {
      render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

      const input = screen.getByRole("spinbutton", { name: /progress/i });
      expect(input).toHaveClass("vhs-input");
    });

    it("drops the shadcn field chrome from the input", () => {
      render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

      const input = screen.getByRole("spinbutton", { name: /progress/i });
      expect(input.className).not.toMatch(/border-primary/);
      expect(input.className).not.toMatch(/bg-muted/);
    });

    it("sizes the input with the inline VHS modifier, not dead w-24 (JD C2)", () => {
      render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

      const input = screen.getByRole("spinbutton", { name: /progress/i });
      expect(input).toHaveClass("vhs-input--inline");
      // w-24 is dead under the custom-layer cascade (.vhs-input width:100%
      // wins) — it must be dropped, not carried as a lie.
      expect(input.className).not.toMatch(/\bw-24\b/);
    });

    it("preserves the spinbutton id, role, and min/max bounds", () => {
      render(<ProgressTracker progress={5} total={12} onChange={() => {}} />);

      const input = screen.getByRole("spinbutton", { name: /progress/i });
      expect(input).toHaveAttribute("id", "progress-input");
      expect(input).toHaveAttribute("type", "number");
      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "12");
    });
  });
});
