import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusSelector } from "@/components/collection/StatusSelector";
import { ProgressTracker } from "@/components/collection/ProgressTracker";

/**
 * D3 guard (R7/S7a-S7c): the phosphor focus ring (`outline: 2px solid
 * var(--vhs-phosphor); outline-offset: 2px`) was triplicated at
 * `.vhs-btn:focus-visible`, `.vhs-input:focus-visible`, and
 * `.vhs-select:focus-visible` in globals.css. Group D extracts ONE shared
 * `.vhs-focus:focus-visible` utility and ADDS the `.vhs-focus` class to the
 * JSX call-sites that already carry `.vhs-btn`/`.vhs-input`/`.vhs-select`.
 *
 * HONEST jsdom LIMIT: jsdom does NOT compute cascaded CSS — it cannot resolve
 * `var(--vhs-phosphor)` nor evaluate which `outline`/`outline-color` rule wins
 * at the cascade. So the rendered focus appearance and the aria-invalid
 * error-color override ordering are NOT unit-testable here; they are guarded by
 * `tsc` + the green suite + a manual visual check (see the apply-progress note).
 * What IS unit-testable and load-bearing is the CLASS PRESENCE on the
 * call-sites (so the shared utility actually applies). We assert exactly that
 * and do not fabricate a CSS-cascade assertion jsdom cannot honor.
 */
describe(".vhs-focus shared focus ring (D3, R7)", () => {
  it("a .vhs-select call-site carries the shared .vhs-focus class", () => {
    render(<StatusSelector status="watching" onChange={() => {}} />);
    const select = screen.getByRole("combobox", { name: /watch status/i });
    expect(select).toHaveClass("vhs-select");
    // Post-extraction the phosphor outline lives on .vhs-focus, so the select
    // must opt into it to keep its focus ring.
    expect(select).toHaveClass("vhs-focus");
  });

  it("a .vhs-input call-site carries the shared .vhs-focus class", () => {
    render(<ProgressTracker progress={3} total={12} onChange={() => {}} />);
    const input = screen.getByRole("spinbutton", { name: /progress/i });
    expect(input).toHaveClass("vhs-input");
    expect(input).toHaveClass("vhs-focus");
    // The input keeps .vhs-input alongside .vhs-focus so the aria-invalid
    // error-color override (keyed to `.vhs-input[aria-invalid="true"]
    // :focus-visible`, declared AFTER both .vhs-focus and .vhs-input
    // :focus-visible in globals.css) still wins. jsdom can't evaluate that
    // cascade; this class-coexistence is the unit-testable proxy.
    expect(input).toHaveClass("vhs-input", "vhs-focus", "vhs-input--inline");
  });
});
