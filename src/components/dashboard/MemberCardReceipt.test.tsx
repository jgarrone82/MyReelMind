import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  MemberCardReceipt,
  type MemberCardStat,
} from "./MemberCardReceipt";

const stats: MemberCardStat[] = [
  { label: "Completed", value: "128", href: "/library?status=completed", accent: "magenta" },
  { label: "Hours watched", value: "291.4", href: "/library?status=completed", accent: "phosphor" },
  { label: "In progress", value: "5", href: "/library?status=watching", accent: "sodium" },
  { label: "To-watch list", value: "37", href: "/library?status=want_to_watch", accent: "acid" },
];

function renderCard(overrides: Partial<React.ComponentProps<typeof MemberCardReceipt>> = {}) {
  return render(
    <MemberCardReceipt
      title="MYREELMIND MEMBER CARD"
      memberLabel="MEMBER"
      memberName="R. DECKARD"
      memberSinceLabel="MEMBER SINCE"
      memberSince="MAR 1985"
      cardNoLabel="CARD NO."
      cardNo="0485-22-1019"
      tallyLabel="— TONIGHT'S TALLY —"
      stats={stats}
      subtotalLabel="SUBTOTAL — TAPES LOGGED"
      subtotalValue="170"
      thankYou="THANK YOU · BE KIND, REWIND"
      drillHint="tap any line to browse →"
      {...overrides}
    />,
  );
}

describe("MemberCardReceipt", () => {
  it("renders the card title and member block", () => {
    renderCard();
    expect(screen.getByText("MYREELMIND MEMBER CARD")).toBeInTheDocument();
    expect(screen.getByText("MEMBER")).toBeInTheDocument();
    expect(screen.getByText("R. DECKARD")).toBeInTheDocument();
    expect(screen.getByText("MEMBER SINCE")).toBeInTheDocument();
    expect(screen.getByText("MAR 1985")).toBeInTheDocument();
    expect(screen.getByText("CARD NO.")).toBeInTheDocument();
  });

  it("renders the tally heading and subtotal", () => {
    renderCard();
    expect(screen.getByText("— TONIGHT'S TALLY —")).toBeInTheDocument();
    expect(screen.getByText("SUBTOTAL — TAPES LOGGED")).toBeInTheDocument();
    expect(screen.getByText("170")).toBeInTheDocument();
  });

  it("renders one drillable link per stat with the right href and value", () => {
    renderCard();
    const completed = screen.getByRole("link", { name: /completed/i });
    expect(completed).toHaveAttribute("href", "/library?status=completed");
    expect(within(completed).getByText("128")).toBeInTheDocument();

    const inProgress = screen.getByRole("link", { name: /in progress/i });
    expect(inProgress).toHaveAttribute("href", "/library?status=watching");
    expect(within(inProgress).getByText("5")).toBeInTheDocument();

    const toWatch = screen.getByRole("link", { name: /to-watch list/i });
    expect(toWatch).toHaveAttribute("href", "/library?status=want_to_watch");
    expect(within(toWatch).getByText("37")).toBeInTheDocument();
  });

  it("renders exactly four stat links", () => {
    renderCard();
    const statLinks = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href")?.startsWith("/library"));
    expect(statLinks).toHaveLength(4);
  });

  it("renders the thank-you and drill hint footer", () => {
    renderCard();
    expect(screen.getByText("THANK YOU · BE KIND, REWIND")).toBeInTheDocument();
    expect(screen.getByText("tap any line to browse →")).toBeInTheDocument();
  });

  it("prints the card number in the footer", () => {
    renderCard();
    expect(screen.getAllByText("0485-22-1019").length).toBeGreaterThan(0);
  });
});
