import * as React from "react";
import { cn } from "@/lib/utils";

export interface MembersOnlyPanelProps
  extends React.HTMLAttributes<HTMLElement> {
  kicker?: string;
  headline: string;
  body?: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiaryNote?: string;
  stamp?: { line1: string; line2: string; line3?: string };
}

export function MembersOnlyPanel({
  kicker,
  headline,
  body,
  primary,
  secondary,
  tertiaryNote,
  stamp = { line1: "MEMBERS", line2: "ONLY", line3: "SECTION · 04" },
  className,
  ...props
}: MembersOnlyPanelProps) {
  return (
    <section
      className={cn(
        "mx-auto grid w-full max-w-[1200px] grid-cols-1 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] shadow-[8px_8px_0_rgba(0,0,0,0.85)] md:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]",
        className,
      )}
      {...props}
    >
      <div className="relative flex flex-col items-center justify-center gap-2 overflow-hidden border-b-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-3)] px-[22px] py-7 md:border-b-0 md:border-r-2">
        <div
          className="flex h-[168px] w-[168px] rotate-[-8deg] flex-col items-center justify-center rounded-full border-4 border-[var(--vhs-error)] p-3 text-center text-[var(--vhs-error)] shadow-[inset_0_0_0_2px_var(--vhs-error)]"
          aria-hidden
        >
          <div className="vhs-kicker text-[1.1rem] leading-none">
            {stamp.line1}
          </div>
          <div className="vhs-display text-[1.7rem] leading-[0.9]">
            {stamp.line2}
          </div>
          {stamp.line3 ? (
            <div className="vhs-mono mt-1 text-[0.55rem] tracking-widest opacity-85">
              {stamp.line3}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[14px] px-[30px] py-7">
        {kicker ? (
          <div className="vhs-kicker text-[0.78rem] text-[var(--vhs-acid)]">
            {kicker}
          </div>
        ) : null}

        <h2 className="vhs-display m-0 text-[clamp(1.7rem,2.8vw,2.4rem)] text-[var(--vhs-cream)]">
          {headline}
        </h2>

        {body ? (
          <p className="vhs-mono m-0 max-w-[540px] text-[0.92rem] leading-relaxed text-[var(--vhs-cream-dim)]">
            {body}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-[14px]">
          {primary}
          {secondary}
        </div>

        {tertiaryNote ? (
          <div className="vhs-script mt-1 inline-block rotate-[-1deg] text-[1.05rem] text-[var(--vhs-sodium)]">
            {tertiaryNote}
          </div>
        ) : null}
      </div>
    </section>
  );
}
