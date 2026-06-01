import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  ActivityReceipt,
  type ActivityReceiptItem,
} from "./ActivityReceipt";

const items: ActivityReceiptItem[] = [
  { title: "Blade Runner", statusLabel: "COMPLETED", statusColor: "acid", timestamp: "TODAY · 21:14", href: "/media/1" },
  { title: "Brazil", statusLabel: "WATCHING", statusColor: "phosphor", timestamp: "MON · 22:31" },
  { title: "Videodrome", statusLabel: "WANT TO WATCH", statusColor: "sodium", timestamp: "SAT · 18:45" },
];

describe("ActivityReceipt", () => {
  it("renders the heading", () => {
    render(<ActivityReceipt heading="Register tape — activity log" items={items} />);
    expect(screen.getByText("Register tape — activity log")).toBeInTheDocument();
  });

  it("renders every item title", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    expect(screen.getByText("Blade Runner")).toBeInTheDocument();
    expect(screen.getByText("Brazil")).toBeInTheDocument();
    expect(screen.getByText("Videodrome")).toBeInTheDocument();
  });

  it("renders the passed-in status labels, not invented event types", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("WATCHING")).toBeInTheDocument();
    expect(screen.getByText("WANT TO WATCH")).toBeInTheDocument();
    // No fabricated event types.
    expect(screen.queryByText("RATED")).not.toBeInTheDocument();
    expect(screen.queryByText("RESUMED")).not.toBeInTheDocument();
  });

  it("renders each item's timestamp", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    expect(screen.getByText("TODAY · 21:14")).toBeInTheDocument();
    expect(screen.getByText("MON · 22:31")).toBeInTheDocument();
    expect(screen.getByText("SAT · 18:45")).toBeInTheDocument();
  });

  it("links an item to its href when provided", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    const link = screen.getByRole("link", { name: /blade runner/i });
    expect(link).toHaveAttribute("href", "/media/1");
  });

  it("does not render a link for items without an href", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    expect(screen.queryByRole("link", { name: /brazil/i })).not.toBeInTheDocument();
    expect(screen.getByText("Brazil")).toBeInTheDocument();
  });

  it("renders one row per item", () => {
    render(<ActivityReceipt heading="Activity" items={items} />);
    const list = screen.getByRole("list");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
  });

  it("renders nothing meaningful for an empty list but does not crash", () => {
    render(<ActivityReceipt heading="Activity" items={[]} />);
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
