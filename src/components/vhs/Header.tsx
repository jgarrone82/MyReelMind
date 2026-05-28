import * as React from "react";
import { cn } from "@/lib/utils";

export interface VhsHeaderProps extends React.HTMLAttributes<HTMLElement> {
  brand: { name: string; sub?: string };
  openLabel?: string;
  guestLabel?: string;
  actions?: React.ReactNode;
}

export function VhsHeader({
  brand,
  openLabel,
  guestLabel,
  actions,
  className,
  ...props
}: VhsHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto grid max-w-[1280px] grid-cols-[1fr_auto] items-center gap-4 border-b-2 border-[var(--vhs-ground-3)] px-3 py-[14px] sm:px-10",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-baseline gap-4">
        <div className="flex items-center gap-[10px]">
          <div
            className="vhs-display grid h-[38px] w-[38px] place-items-center rotate-[-3deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-magenta)] text-2xl text-[var(--vhs-cream)] shadow-[3px_3px_0_var(--vhs-ground)]"
            aria-hidden
          >
            M
          </div>
          <div>
            <div
              className="vhs-display text-[1.55rem] leading-[0.95] text-[var(--vhs-cream)]"
            >
              {brand.name}
            </div>
            {brand.sub ? (
              <div className="vhs-mono text-[0.7rem] tracking-wider text-[var(--vhs-cream-dim)]">
                {brand.sub}
              </div>
            ) : null}
          </div>
        </div>
        {openLabel ? (
          <span className="vhs-kicker ml-1 border-[1.5px] border-[var(--vhs-acid)] px-[10px] py-[3px] text-[0.78rem] text-[var(--vhs-acid)]">
            ● {openLabel}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-[14px]">
        {guestLabel ? (
          <span className="vhs-mono text-[0.75rem] text-[var(--vhs-cream-dim)]">
            [{guestLabel}]
          </span>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
