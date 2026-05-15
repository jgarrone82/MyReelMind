import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("globals.css tokens", () => {
  const cssPath = join(process.cwd(), "src/app/globals.css");
  let css: string;

  beforeAll(() => {
    css = readFileSync(cssPath, "utf-8");
  });

  describe(":root tokens", () => {
    const expectedRootTokens: Record<string, string> = {
      "--bg-primary": "#ffffff",
      "--bg-secondary": "#f9fafb",
      "--text-primary": "#111827",
      "--text-secondary": "#6b7280",
      "--border-primary": "#e5e7eb",
      "--accent": "#2563eb",
      "--accent-hover": "#1d4ed8",
      "--error": "#dc2626",
      "--muted": "#f3f4f6",
    };

    it("should define all required CSS custom properties in :root", () => {
      const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
      expect(rootMatch).toBeTruthy();

      const rootBlock = rootMatch![1];
      for (const [token, expectedValue] of Object.entries(expectedRootTokens)) {
        expect(rootBlock).toContain(`${token}: ${expectedValue}`);
      }
    });

    it("should NOT contain bg-white, text-gray-900, or similar hardcoded classes", () => {
      // These should be migrated to semantic tokens
      expect(css).not.toContain("bg-white");
      expect(css).not.toContain("text-gray-900");
      expect(css).not.toContain("border-gray-200");
    });
  });

  describe(".dark tokens", () => {
    const expectedDarkTokens: Record<string, string> = {
      "--bg-primary": "#0f172a",
      "--bg-secondary": "#1e293b",
      "--text-primary": "#f1f5f9",
      "--text-secondary": "#94a3b8",
      "--border-primary": "#334155",
      "--accent": "#3b82f6",
      "--accent-hover": "#60a5fa",
      "--error": "#f87171",
      "--muted": "#1e293b",
    };

    it("should define dark mode custom properties in .dark selector", () => {
      const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);
      expect(darkMatch).toBeTruthy();

      const darkBlock = darkMatch![1];
      for (const [token, expectedValue] of Object.entries(expectedDarkTokens)) {
        expect(darkBlock).toContain(`${token}: ${expectedValue}`);
      }
    });
  });

  describe("@custom-variant dark", () => {
    it("should define dark variant for Tailwind v4", () => {
      expect(css).toContain('@custom-variant dark');
    });
  });

  describe("@theme color mapping", () => {
    const expectedThemeMappings = [
      "--color-primary",
      "--color-secondary",
      "--color-accent",
      "--color-accent-hover",
      "--color-error",
      "--color-muted",
    ];

    it("should map CSS variables to Tailwind theme utilities", () => {
      const themeMatch = css.match(/@theme\s*\{([^}]+)\}/);
      expect(themeMatch).toBeTruthy();

      const themeBlock = themeMatch![1];
      for (const mapping of expectedThemeMappings) {
        expect(themeBlock).toContain(mapping);
      }
    });
  });
});