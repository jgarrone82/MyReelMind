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
});
