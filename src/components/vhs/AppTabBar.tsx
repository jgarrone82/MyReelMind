"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Home, Search, LibraryBig, Settings } from "lucide-react";
import { TabBar, type TabItem } from "./TabBar";

interface AppNavLabels {
  home: string;
  search: string;
  library: string;
  settings: string;
}

interface AppTabBarProps {
  lang: string;
  nav: AppNavLabels;
}

const ICON_SIZE = 20;

/**
 * Client wrapper around the presentational TabBar that derives the active tab
 * from usePathname only (no useSearchParams → no CSR Suspense bailout).
 *
 * Path mapping (segments after the locale):
 *   /[lang]                 → '' → Home
 *   /[lang]/search          → 'search'   → Search
 *   /[lang]/library         → 'library'  → Library
 *   /[lang]/settings        → 'settings' → Settings
 *   /[lang]/media/[id]      → 'media'    → no active tab (detail page)
 *   /[lang]/users/[id]      → 'users'    → no active tab (detail page)
 */
export function AppTabBar({ lang, nav }: AppTabBarProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ['en', 'search']
  const sub = segments[1] ?? ""; // '' for /en (Home)

  const activeId =
    sub === ""
      ? "home"
      : sub === "search"
        ? "search"
        : sub === "library"
          ? "library"
          : sub === "settings"
            ? "settings"
            : undefined; // media/[id], users/[id] → no active tab

  const tabs: TabItem[] = [
    {
      id: "home",
      label: nav.home,
      icon: <Home size={ICON_SIZE} aria-hidden />,
      accent: "phosphor",
      href: `/${lang}`,
    },
    {
      id: "search",
      label: nav.search,
      icon: <Search size={ICON_SIZE} aria-hidden />,
      accent: "acid",
      href: `/${lang}/search`,
    },
    {
      id: "library",
      label: nav.library,
      icon: <LibraryBig size={ICON_SIZE} aria-hidden />,
      accent: "magenta",
      href: `/${lang}/library`,
    },
    {
      id: "settings",
      label: nav.settings,
      icon: <Settings size={ICON_SIZE} aria-hidden />,
      accent: "sodium",
      href: `/${lang}/settings`,
    },
  ];

  return (
    <TabBar
      tabs={tabs}
      activeId={activeId}
      // Override TabBar's fixed-bottom floating placement into a static top row.
      // Explicit counter-utilities neutralize fixed/translate/inset (twMerge —
      // last wins). bottom/left are inert under `static`, but cleared for clarity.
      className="static bottom-auto left-auto mx-auto my-4 w-full max-w-[1280px] translate-x-0"
    />
  );
}
