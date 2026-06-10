import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusSelector } from "./StatusSelector";

const statuses = [
  { value: "want_to_watch", label: "Want to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
  { value: "dropped", label: "Dropped" },
] as const;

describe("StatusSelector", () => {
  it("should render with current status selected", () => {
    render(<StatusSelector status="watching" onChange={() => {}} />);

    const select = screen.getByRole("combobox", { name: /watch status/i });
    expect(select).toHaveValue("watching");
  });

  it("should call onChange when user selects a different status", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<StatusSelector status="want_to_watch" onChange={handleChange} />);

    const select = screen.getByRole("combobox", { name: /watch status/i });
    await user.selectOptions(select, "completed");

    expect(handleChange).toHaveBeenCalledWith("completed");
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should display human-readable labels for each status", () => {
    render(<StatusSelector status="want_to_watch" onChange={() => {}} />);

    for (const { label } of statuses) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("should be disabled when disabled prop is true", () => {
    render(<StatusSelector status="watching" onChange={() => {}} disabled />);

    const select = screen.getByRole("combobox", { name: /watch status/i });
    expect(select).toBeDisabled();
  });

  it("should be enabled by default", () => {
    render(<StatusSelector status="watching" onChange={() => {}} />);

    const select = screen.getByRole("combobox", { name: /watch status/i });
    expect(select).toBeEnabled();
  });

  // VHS restyle (R20/S15): the select adopts the shared .vhs-select utility and
  // drops the shadcn border-primary/bg-primary chrome, while keeping its id,
  // aria-label, and the full option mapping (same options/values/order).
  describe("VHS treatment (R20/S15)", () => {
    it("adopts the shared .vhs-select utility on the native select", () => {
      render(<StatusSelector status="watching" onChange={() => {}} />);

      const select = screen.getByRole("combobox", { name: /watch status/i });
      expect(select).toHaveClass("vhs-select");
    });

    it("drops the shadcn field chrome from the select", () => {
      render(<StatusSelector status="watching" onChange={() => {}} />);

      const select = screen.getByRole("combobox", { name: /watch status/i });
      expect(select.className).not.toMatch(/border-primary/);
      expect(select.className).not.toMatch(/bg-primary/);
      expect(select.className).not.toMatch(/bg-muted/);
    });

    it("keeps the id, aria-label, and full option mapping", () => {
      render(<StatusSelector status="watching" onChange={() => {}} />);

      const select = screen.getByRole("combobox", {
        name: "Watch status",
      }) as HTMLSelectElement;
      expect(select).toHaveAttribute("id", "watch-status");
      const values = Array.from(select.options).map((o) => o.value);
      expect(values).toEqual(statuses.map((s) => s.value));
    });
  });
});
