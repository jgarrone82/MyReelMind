import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // Rule overrides for main codebase
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  
  // Exclude E2E tests from React hooks rules (Playwright fixtures use `use()` pattern)
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/e2e/**/*.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "off", // Common in Vitest mocks
    },
  },
  
  // Stricter rules for non-test code
  {
    files: ["src/**/*.{ts,tsx}", "!src/**/*.test.{ts,tsx}", "!src/e2e/**/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
    },
  },
];

export default eslintConfig;
