import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("[lang] root layout", () => {
  const layoutPath = join(process.cwd(), "src/app/[lang]/layout.tsx");
  const content = readFileSync(layoutPath, "utf-8");

  it("forces always-dark via className=\"dark\" on <html>", () => {
    expect(content).toContain('className="dark"');
  });

  it("preserves the dynamic per-locale lang on <html>", () => {
    expect(content).toContain("lang={lang}");
  });

  it("sets both lang={lang} and className=\"dark\" on the same <html>", () => {
    expect(content).toMatch(/<html[^>]*lang=\{lang\}[^>]*className="dark"/);
  });

  it("paints the body with the VHS ground background token", () => {
    expect(content).toMatch(/var\(--vhs-ground\)/);
  });

  it("paints the body with the VHS cream text token", () => {
    expect(content).toMatch(/var\(--vhs-cream\)/);
  });

  it("has zero suppressHydrationWarning occurrences", () => {
    expect(content.match(/suppressHydrationWarning/g)).toBeNull();
  });

  it("does not reference next-themes", () => {
    expect(content).not.toContain("next-themes");
  });

  it("does not reference ThemeProvider", () => {
    expect(content).not.toContain("ThemeProvider");
  });

  it("does not reference ThemeToggle", () => {
    expect(content).not.toContain("ThemeToggle");
  });
});
