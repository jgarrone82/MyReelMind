import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CRTFrame } from "./CRTFrame";

describe("CRTFrame", () => {
  it("renders its children inside the screen area", () => {
    render(
      <CRTFrame>
        <p>insert tape</p>
      </CRTFrame>,
    );
    expect(screen.getByText("insert tape")).toBeInTheDocument();
  });

  it("forwards an extra className onto the outer bezel", () => {
    const { container } = render(
      <CRTFrame className="custom-frame">
        <span>child</span>
      </CRTFrame>,
    );
    const bezel = container.firstElementChild as HTMLElement;
    expect(bezel).toHaveClass("custom-frame");
  });

  it("renders the bezel + inner screen structure", () => {
    const { container } = render(
      <CRTFrame data-testid="crt">
        <span>child</span>
      </CRTFrame>,
    );
    const bezel = screen.getByTestId("crt");
    expect(bezel).toBe(container.firstElementChild);
    // Outer bezel uses the ground-3 surface.
    expect(bezel.className).toContain("--vhs-ground-3");
    // Inner screen carries the amplified scanlines texture.
    const screen_ = bezel.querySelector(".vhs-scanlines");
    expect(screen_).not.toBeNull();
  });

  it("applies the phosphor glow border by default", () => {
    const { container } = render(
      <CRTFrame>
        <span>child</span>
      </CRTFrame>,
    );
    expect(container.querySelector(".vhs-glow-phosphor")).not.toBeNull();
  });

  it("applies the requested glow color", () => {
    const { container } = render(
      <CRTFrame glow="magenta">
        <span>child</span>
      </CRTFrame>,
    );
    expect(container.querySelector(".vhs-glow-magenta")).not.toBeNull();
    expect(container.querySelector(".vhs-glow-phosphor")).toBeNull();
  });

  it("forwards arbitrary HTML attributes onto the outer bezel", () => {
    render(
      <CRTFrame aria-label="search terminal">
        <span>child</span>
      </CRTFrame>,
    );
    expect(screen.getByLabelText("search terminal")).toBeInTheDocument();
  });

  it("does not add a bogus role to the decorative wrapper", () => {
    const { container } = render(
      <CRTFrame>
        <span>child</span>
      </CRTFrame>,
    );
    const bezel = container.firstElementChild as HTMLElement;
    expect(bezel.getAttribute("role")).toBeNull();
  });
});
