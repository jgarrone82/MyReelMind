"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabAccent = "cream" | "magenta" | "acid" | "phosphor" | "sodium";

const ACCENT_VAR: Record<TabAccent, string> = {
  cream: "var(--vhs-cream)",
  magenta: "var(--vhs-magenta)",
  acid: "var(--vhs-acid)",
  phosphor: "var(--vhs-phosphor)",
  sodium: "var(--vhs-sodium)",
};

export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  accent?: TabAccent;
  href?: string;
}

export interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  tabs: TabItem[];
  activeId?: string;
  brandLabel?: string;
  onTabChange?: (id: string) => void;
}

export function TabBar({
  tabs,
  activeId,
  brandLabel,
  onTabChange,
  className,
  ...props
}: TabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-[18px] left-1/2 z-50 grid -translate-x-1/2 grid-cols-4 gap-2 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] p-[10px]",
        "shadow-[6px_6px_0_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur",
        "w-[min(720px,calc(100vw-32px))]",
        className,
      )}
      {...props}
    >
      {brandLabel ? (
        <span className="vhs-kicker absolute -top-[14px] left-[18px] rotate-[-3deg] border-[1.5px] border-[var(--vhs-ground)] bg-[var(--vhs-cream)] px-[10px] py-[3px] text-[0.65rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
          {brandLabel}
        </span>
      ) : null}

      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const accentVar = ACCENT_VAR[tab.accent ?? "magenta"];
        const className = cn(
          "vhs-kicker flex flex-col items-center gap-[6px] rounded-[2px] border-2 border-[var(--vhs-ground)] px-[6px] pt-3 pb-[10px] text-[0.85rem]",
          "transition-[transform,box-shadow,background] duration-[120ms] ease-[cubic-bezier(0.3,0,0.7,1)]",
          isActive
            ? "text-[var(--vhs-ground)]"
            : "bg-[var(--vhs-ground-3)] text-[var(--vhs-cream)] shadow-[3px_3px_0_var(--vhs-ground)] hover:-translate-x-px hover:-translate-y-px",
        );
        const style: React.CSSProperties = isActive
          ? {
              background: accentVar,
              boxShadow: `inset 0 0 0 2px ${accentVar}, 0 0 22px ${accentVar}66, 2px 2px 0 var(--vhs-ground)`,
            }
          : {};
        const content = (
          <>
            <span aria-hidden style={{ color: isActive ? "var(--vhs-ground)" : accentVar }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </>
        );

        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={className}
              style={style}
              onClick={() => onTabChange?.(tab.id)}
            >
              {content}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={className}
            style={style}
            onClick={() => onTabChange?.(tab.id)}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
