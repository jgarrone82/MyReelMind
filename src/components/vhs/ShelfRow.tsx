import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ShelfRowAccent = "acid" | "sodium" | "magenta" | "phosphor";

const ACCENT_VAR: Record<ShelfRowAccent, string> = {
  acid: "var(--vhs-acid)",
  sodium: "var(--vhs-sodium)",
  magenta: "var(--vhs-magenta)",
  phosphor: "var(--vhs-phosphor)",
};

export interface ShelfRowProps {
  /** Druk-condensed kicker label, e.g. "Recently watched". */
  kicker: string;
  /** Bracketed item count shown next to the kicker. */
  count?: number;
  /** Permanent-Marker annotation, e.g. "★ logged tonight". */
  note?: string;
  /** Ghost "See all →" link text. Only renders a link when seeAllHref is set. */
  seeAllLabel?: string;
  seeAllHref?: string;
  /** Kicker accent color. Defaults to acid. */
  accent?: ShelfRowAccent;
  /** The cards rendered in the horizontal snap-scroll track. */
  children: React.ReactNode;
  className?: string;
}

/**
 * Generic "Shelf Row" pattern from the VHS design system (§7): a double-rule
 * header (kicker + [count] + optional marker note + ghost "See all →") above a
 * horizontal snap-scroll track of cards.
 */
export function ShelfRow({
  kicker,
  count,
  note,
  seeAllLabel,
  seeAllHref,
  accent = "acid",
  children,
  className,
}: ShelfRowProps) {
  const accentColor = ACCENT_VAR[accent];

  return (
    <section
      aria-label={kicker}
      className={cn("mx-auto mt-10 w-full max-w-[1200px]", className)}
    >
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-double border-[var(--vhs-cream-dim)] pb-2">
        <div className="flex items-baseline gap-[14px]">
          <span
            className="vhs-kicker whitespace-nowrap border-b-[3px] pb-[2px] text-[1.05rem]"
            style={{
              color: accentColor,
              borderColor: accentColor,
              textShadow: `0 0 12px ${accentColor}55`,
            }}
          >
            {kicker}
          </span>
          {count != null ? (
            <span className="vhs-mono text-[0.72rem] text-[var(--vhs-cream-dim)]">
              [{count}]
            </span>
          ) : null}
          {note ? (
            <span className="vhs-script inline-block rotate-[-2deg] text-[1rem] text-[var(--vhs-sodium)]">
              {note}
            </span>
          ) : null}
        </div>

        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="vhs-btn--ghost vhs-aberrate rounded-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vhs-phosphor)]"
          >
            {seeAllLabel ?? "See all"} →
          </Link>
        ) : null}
      </div>

      <ul
        className={cn(
          "vhs-shelf-track grid list-none grid-flow-col gap-[22px] overflow-x-auto pb-[14px]",
          "[grid-auto-columns:minmax(160px,200px)]",
        )}
      >
        {React.Children.toArray(children).map((child) => (
          <li
            key={React.isValidElement(child) ? child.key : undefined}
            className="snap-start"
          >
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
