import { describe, it, expect } from "vitest";
import { buttonVariants } from "./button";

/**
 * D3 guard (R9/S9): the `outline` button variant's focus/border ring was the
 * off-palette shadcn grey (`border-border` light / `dark:border-input`). Group D
 * re-themes ONLY that ring to the VHS phosphor token so the primitive's default
 * outline ring matches the rest of the VHS focus system. This is the single
 * SANCTIONED ui/* edit; every other variant/size MUST stay untouched.
 *
 * We assert on the className string produced by `buttonVariants` (the cva
 * factory) rather than rendering — jsdom cannot resolve CSS-var computed
 * styles, but the token presence in the class list is the load-bearing,
 * unit-testable signal.
 */
describe("button outline variant ring (D3, R9)", () => {
  it("uses the VHS phosphor token for the outline variant border ring", () => {
    const classes = buttonVariants({ variant: "outline" });
    expect(classes).toMatch(/border-\[var\(--vhs-phosphor\)\]/);
    expect(classes).toMatch(/dark:border-\[var\(--vhs-phosphor\)\]/);
    // The grey shadcn ring tokens must be gone from the outline variant.
    expect(classes).not.toMatch(/\bborder-border\b/);
    expect(classes).not.toMatch(/dark:border-input\b/);
  });

  it("leaves the other variants' palette untouched", () => {
    // default keeps bg-primary; destructive keeps its destructive palette;
    // none of them should accidentally gain the phosphor border token.
    expect(buttonVariants({ variant: "default" })).toMatch(/bg-primary/);
    expect(buttonVariants({ variant: "destructive" })).toMatch(
      /bg-destructive\/10/
    );
    expect(buttonVariants({ variant: "secondary" })).toMatch(/bg-secondary/);
    expect(buttonVariants({ variant: "ghost" })).not.toMatch(
      /border-\[var\(--vhs-phosphor\)\]/
    );
  });
});
