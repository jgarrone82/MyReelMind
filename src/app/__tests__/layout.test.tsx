import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("root layout", () => {
  const layoutPath = join(process.cwd(), "src/app/layout.tsx");

  it("should include ThemeProvider from next-themes", () => {
    const content = readFileSync(layoutPath, "utf-8");
    expect(content).toContain("ThemeProvider");
    expect(content).toContain('from "next-themes"');
  });

  it("should have suppressHydrationWarning on html and body", () => {
    const content = readFileSync(layoutPath, "utf-8");
    expect(content).toContain("suppressHydrationWarning");
    // Should appear at least twice: once on <html> and once on <body>
    const matches = content.match(/suppressHydrationWarning/g);
    expect(matches).toHaveLength(2);
  });

  it("should use attribute='class' on ThemeProvider", () => {
    const content = readFileSync(layoutPath, "utf-8");
    expect(content).toContain('attribute="class"');
    expect(content).toContain('defaultTheme="system"');
    expect(content).toContain("enableSystem");
  });
});