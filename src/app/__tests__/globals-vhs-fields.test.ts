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

    it("defines a phosphor focus-visible outline", () => {
      const b = block(".vhs-input:focus-visible");
      expect(b).toContain("outline: 2px solid var(--vhs-phosphor)");
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

    it("defines a phosphor focus-visible outline", () => {
      const b = block(".vhs-select:focus-visible");
      expect(b).toContain("outline: 2px solid var(--vhs-phosphor)");
    });

    it("defines a disabled state", () => {
      const b = block(".vhs-select:disabled");
      expect(b).toContain("cursor: not-allowed");
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
