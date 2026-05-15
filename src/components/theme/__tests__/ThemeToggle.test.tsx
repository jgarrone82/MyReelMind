import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mutable ref to hold mock state - allows per-test reconfiguration
let mockTheme = "system";
let mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme === "system" ? "light" : mockTheme,
  }),
}));

// Import after mock setup
import { ThemeToggle } from "../ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockTheme = "system";
    mockSetTheme = vi.fn();
  });

  it("should render with system icon and aria-label by default", () => {
    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "System theme");
    expect(button).toHaveTextContent("🖥");
  });

  it("should render light theme icon when theme is light", () => {
    mockTheme = "light";

    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Light theme");
    expect(button).toHaveTextContent("☀");
  });

  it("should render dark theme icon when theme is dark", () => {
    mockTheme = "dark";

    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Dark theme");
    expect(button).toHaveTextContent("🌙");
  });

  it("should call setTheme with 'light' when clicked from system", async () => {
    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    await userEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should call setTheme with 'dark' when clicked from light", async () => {
    mockTheme = "light";

    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    await userEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should call setTheme with 'system' when clicked from dark", async () => {
    mockTheme = "dark";

    render(
      <ThemeToggle
        dict={{
          themeSystem: "System theme",
          themeLight: "Light theme",
          themeDark: "Dark theme",
        }}
      />
    );

    await userEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});