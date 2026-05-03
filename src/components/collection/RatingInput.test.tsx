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
});
