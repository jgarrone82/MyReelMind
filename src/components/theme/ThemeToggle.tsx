"use client";

import { useTheme } from "next-themes";

interface ThemeToggleProps {
  dict: {
    themeSystem: string;
    themeLight: string;
    themeDark: string;
  };
}

export function ThemeToggle({ dict }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getLabel = () => {
    if (theme === "light") return dict.themeLight;
    if (theme === "dark") return dict.themeDark;
    return dict.themeSystem;
  };

  const getIcon = () => {
    if (theme === "light") return "☀";
    if (theme === "dark") return "🌙";
    return "🖥";
  };

  return (
    <button
      onClick={cycleTheme}
      aria-label={getLabel()}
      className="rounded-md p-2 hover:bg-muted transition-colors"
    >
      <span className="text-lg" aria-hidden="true">
        {getIcon()}
      </span>
    </button>
  );
}