import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicProfileCard } from "./PublicProfileCard";

const dict = { items: "Items", completed: "Completed", watching: "Watching" };
const stats = { total: 12, completed: 5, watching: 3 };

describe("PublicProfileCard", () => {
  it("renders the display name as a VHS display heading (R31)", () => {
    render(
      <PublicProfileCard
        user={{ id: "u1", displayName: "Ana Lovelace", avatarUrl: null }}
        stats={stats}
        dict={dict}
      />
    );

    const heading = screen.getByRole("heading", { name: "Ana Lovelace" });
    expect(heading.className).toContain("vhs-display");
    // R31/R5: no shadcn/grey chrome leaks on the name
    expect(heading.className).not.toContain("text-primary");
  });

  it("falls back to a ground-family avatar with initials, never bg-accent/text-white (R31/R5)", () => {
    const { container } = render(
      <PublicProfileCard
        user={{ id: "u1", displayName: "Ada Byron", avatarUrl: null }}
        stats={stats}
        dict={dict}
      />
    );

    expect(screen.getByText("AB")).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("bg-accent");
    expect(container.innerHTML).not.toContain("text-white");
  });

  it("renders the three stat counters with their values and labels", () => {
    render(
      <PublicProfileCard
        user={{ id: "u1", displayName: "Ana", avatarUrl: null }}
        stats={stats}
        dict={dict}
      />
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Watching")).toBeInTheDocument();
  });

  it("does not retain residual grey/shadcn token chrome (R5/S13)", () => {
    const { container } = render(
      <PublicProfileCard
        user={{ id: "u1", displayName: "Ana", avatarUrl: null }}
        stats={stats}
        dict={dict}
      />
    );

    const html = container.innerHTML;
    expect(html).not.toContain("text-secondary");
    expect(html).not.toMatch(/\btext-gray-/);
    expect(html).not.toMatch(/\bbg-gray-/);
  });
});
