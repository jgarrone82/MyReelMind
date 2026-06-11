import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Regression markers for the shared VHS field utilities (issue #51, slice C1).
 * globals.css is not directly renderable in vitest, so these tests assert the
 * utility definitions exist with their load-bearing declarations — the same
 * file-content pattern used by globals-tokens.test.ts.
 */
describe("globals.css VHS field utilities", () => {
  const cssPath = join(process.cwd(), "src/app/globals.css");
  let css: string;

  beforeAll(() => {
    css = readFileSync(cssPath, "utf-8");
  });

  /**
   * Extracts the declaration block for a selector. Tolerates the selector
   * appearing inside a selector list (e.g. `.a, .b { ... }`).
   */
  function block(selector: string): string {
    const escaped = selector.replace(/[.[\]]/g, (c) => `\\${c}`);
    const match = css.match(new RegExp(`${escaped}[^{}]*\\{([^}]+)\\}`));
    expect(match, `expected ${selector} block in globals.css`).toBeTruthy();
    return match![1];
  }

  describe(".vhs-input", () => {
    it("defines the ground-2 field surface with cream text and ground-3 border", () => {
      const b = block(".vhs-input");
      expect(b).toContain("background: var(--vhs-ground-2)");
      expect(b).toContain("color: var(--vhs-cream)");
      expect(b).toContain("border: 2px solid var(--vhs-ground-3)");
    });

    it("keeps the phosphor border on focus (the outline now lives on the shared .vhs-focus utility — issue #51 D3)", () => {
      // D3 extracted the duplicated `outline: 2px solid var(--vhs-phosphor)` into
      // the shared `.vhs-focus:focus-visible` utility. `.vhs-input:focus-visible`
      // keeps only its per-element extra (the phosphor border-color); the outline
      // is asserted on `.vhs-focus` below.
      const b = block(".vhs-input:focus-visible");
      expect(b).toContain("border-color: var(--vhs-phosphor)");
      expect(b).not.toContain("outline:");
    });

    it("defines a dim placeholder state", () => {
      const b = block(".vhs-input::placeholder");
      expect(b).toContain("var(--vhs-cream-dim)");
    });

    it("defines a disabled state", () => {
      const b = block(".vhs-input:disabled");
      expect(b).toContain("cursor: not-allowed");
    });

    it("couples the error state to aria-invalid", () => {
      expect(css).toMatch(/\.vhs-input\[aria-invalid="true"\]/);
      const b = block('.vhs-input[aria-invalid="true"]');
      expect(b).toContain("border-color: var(--vhs-error)");
    });
  });

  describe(".vhs-select", () => {
    it("defines the same field treatment as .vhs-input", () => {
      const b = block(".vhs-select");
      expect(b).toContain("background: var(--vhs-ground-2)");
      expect(b).toContain("color: var(--vhs-cream)");
      expect(b).toContain("border: 2px solid var(--vhs-ground-3)");
    });

    it("keeps the phosphor border on focus (the outline now lives on the shared .vhs-focus utility — issue #51 D3)", () => {
      const b = block(".vhs-select:focus-visible");
      expect(b).toContain("border-color: var(--vhs-phosphor)");
      expect(b).not.toContain("outline:");
    });

    it("defines a disabled state", () => {
      const b = block(".vhs-select:disabled");
      expect(b).toContain("cursor: not-allowed");
    });
  });

  describe(".vhs-focus shared focus ring (issue #51 D3)", () => {
    it("is the single source of the phosphor outline + offset", () => {
      const b = block(".vhs-focus:focus-visible");
      expect(b).toContain("outline: 2px solid var(--vhs-phosphor)");
      expect(b).toContain("outline-offset: 2px");
    });

    it("touches outline ONLY — never box-shadow — so the .vhs-btn depth stack survives", () => {
      const b = block(".vhs-focus:focus-visible");
      expect(b).not.toContain("box-shadow");
    });

    it("is declared BEFORE the btn/input/select rules so their later extras win at equal specificity (load-bearing order)", () => {
      const focusIdx = css.indexOf(".vhs-focus:focus-visible");
      expect(focusIdx).toBeGreaterThan(-1);
      // Earlier in source order than .vhs-btn and the field rules.
      expect(focusIdx).toBeLessThan(css.indexOf(".vhs-btn {"));
      expect(focusIdx).toBeLessThan(css.indexOf(".vhs-input {"));
      expect(focusIdx).toBeLessThan(css.indexOf(".vhs-select {"));
    });

    it("is declared BEFORE the aria-invalid error-color override so the error outline still wins", () => {
      const focusIdx = css.indexOf(".vhs-focus:focus-visible");
      const ariaInvalidFocusIdx = css.indexOf(
        '.vhs-input[aria-invalid="true"]:focus-visible'
      );
      expect(ariaInvalidFocusIdx).toBeGreaterThan(-1);
      expect(focusIdx).toBeLessThan(ariaInvalidFocusIdx);
      // The override patches outline-color (longhand) to the error token; it is
      // later in source AND higher specificity (class + attribute + pseudo), so
      // it wins over the .vhs-focus outline shorthand.
      const override = block('.vhs-input[aria-invalid="true"]:focus-visible');
      expect(override).toContain("outline-color: var(--vhs-error)");
    });
  });

  describe(".vhs-btn--compact (collection controls, JD C2)", () => {
    it("defines compact padding so the cancel button does not need dead Tailwind px/py", () => {
      const b = block(".vhs-btn--compact");
      expect(b).toContain("padding: 6px 12px 5px");
    });

    it("is declared AFTER its .vhs-btn base AND its --secondary/--ghost variants so it survives the custom-layer cascade", () => {
      // Tailwind v4 emits generated utilities at the @import position (top of
      // file); the hand-authored @layer utilities block comes later. Within
      // that block, equal-specificity rules resolve by source order, so a
      // modifier MUST sit after .vhs-btn AND after the --secondary/--ghost
      // variants (which a compact secondary/ghost button also carries) to
      // override their padding.
      const compactIdx = css.indexOf(".vhs-btn--compact");
      expect(compactIdx).toBeGreaterThan(css.indexOf(".vhs-btn {"));
      expect(compactIdx).toBeGreaterThan(css.indexOf(".vhs-btn--secondary {"));
      expect(compactIdx).toBeGreaterThan(css.indexOf(".vhs-btn--ghost {"));
    });
  });

  describe(".vhs-input--inline (progress tracker, JD C2)", () => {
    it("defines a fixed inline width so the input does not need dead w-24", () => {
      const b = block(".vhs-input--inline");
      expect(b).toContain("width: 6rem");
    });

    it("is declared AFTER its .vhs-input base so it survives the custom-layer cascade", () => {
      expect(css.indexOf(".vhs-input--inline")).toBeGreaterThan(
        css.indexOf(".vhs-input {")
      );
    });
  });

  describe(".vhs-btn:focus-visible synthetic ground offset (JD C2, R4 parity)", () => {
    it("paints a ground-colored band so the shared .vhs-focus phosphor outline reads as a ring on every .vhs-btn", () => {
      // D3: the phosphor outline now lives on the shared `.vhs-focus` utility
      // (asserted in its own describe). `.vhs-btn:focus-visible` keeps ONLY the
      // synthetic ground-colored band so the outline still reads as a ring; it
      // must NOT carry the outline itself (single source) — and crucially must
      // still set the box-shadow band, which .vhs-focus never touches.
      const b = block(".vhs-btn:focus-visible");
      expect(b).not.toContain("outline:");
      expect(b).toContain("box-shadow: 0 0 0 2px var(--vhs-ground)");
    });

    it("retains the sodium depth shadow on focus for primary buttons (JD C2 Round 2, box-shadow regression guard)", () => {
      // The base .vhs-btn carries `box-shadow: 3px 3px 0 var(--vhs-sodium)`.
      // The synthetic ground band on .vhs-btn:focus-visible (0 0 0 2px ground)
      // REPLACES box-shadow, so on keyboard focus a primary button would lose
      // its signature sodium depth — and animate it away (transition:
      // box-shadow 90ms). A primary-scoped focus rule must STACK the sodium
      // shadow with the ground band so the depth survives focus. The selector
      // excludes --secondary/--ghost (box-shadow:none at rest) so they do NOT
      // gain a focus-only sodium shadow. Matched with a raw regex because the
      // block() helper does not escape the parens in :not(...).
      const primaryFocus = css.match(
        /\.vhs-btn:not\(\.vhs-btn--secondary\):not\(\.vhs-btn--ghost\):focus-visible[^{}]*\{([^}]+)\}/
      );
      expect(
        primaryFocus,
        "expected primary-scoped .vhs-btn focus-visible rule in globals.css"
      ).toBeTruthy();
      const b = primaryFocus![1];
      expect(b).toContain("3px 3px 0 var(--vhs-sodium)");
      expect(b).toContain("0 0 0 2px var(--vhs-ground)");
    });
  });

  describe("toast accent helpers (sonner classNames)", () => {
    it("defines a sodium accent for success toasts, !important to beat sonner's inline border", () => {
      const b = block(".vhs-toast--success");
      expect(b).toContain("border-left: 3px solid var(--vhs-sodium) !important");
    });

    it("defines an error accent for error toasts, !important to beat sonner's inline border", () => {
      const b = block(".vhs-toast--error");
      expect(b).toContain("border-left: 3px solid var(--vhs-error) !important");
    });
  });
});
