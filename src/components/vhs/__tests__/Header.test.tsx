import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VhsHeader } from "../Header";

describe("VhsHeader", () => {
  it("renders the brand as a link with the given href and the clean wordmark as its accessible name", () => {
    render(
      <VhsHeader brand={{ name: "MyReelMind", sub: "tape deck" }} brandHref="/en" />,
    );
    const link = screen.getByRole("link", { name: "MyReelMind" });
    expect(link).toHaveAttribute("href", "/en");
  });

  it("does not render the brand as a link when brandHref is omitted", () => {
    render(<VhsHeader brand={{ name: "MyReelMind", sub: "tape deck" }} />);
    expect(
      screen.queryByRole("link", { name: /myreelmind/i }),
    ).not.toBeInTheDocument();
  });
});
