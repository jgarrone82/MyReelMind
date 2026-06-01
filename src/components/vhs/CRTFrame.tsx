import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const GLOW_CLASS = {
  phosphor: "vhs-glow-phosphor",
  magenta: "vhs-glow-magenta",
  acid: "vhs-glow-acid",
  sodium: "vhs-glow-sodium",
} as const;

const GLOW_BORDER: Record<keyof typeof GLOW_CLASS, string> = {
  phosphor: "var(--vhs-phosphor)",
  magenta: "var(--vhs-magenta)",
  acid: "var(--vhs-acid)",
  sodium: "var(--vhs-sodium)",
};

const bezelVariants = cva(
  // Thick rounded outer bezel on the ground-3 surface, hard offset shadow like
  // the other VHS primitives — this is the "tube housing".
  "relative rounded-[18px] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-3)] p-3 shadow-[6px_6px_0_rgba(0,0,0,0.85)]",
  {
    variants: {
      glow: {
        phosphor: "",
        magenta: "",
        acid: "",
        sodium: "",
      },
    },
    defaultVariants: { glow: "phosphor" },
  },
);

export type CRTFrameGlow = NonNullable<
  VariantProps<typeof bezelVariants>["glow"]
>;

export interface CRTFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content rendered inside the glowing CRT screen. */
  children: React.ReactNode;
  /** Phosphor border + glow color. Defaults to the CRT cyan ("phosphor"). */
  glow?: CRTFrameGlow;
  className?: string;
}

/**
 * CRT Display Frame from the VHS design system (§7): a thick rounded ground-3
 * outer bezel housing an inner screen with amplified scanlines and a glowing
 * phosphor border. Purely presentational/decorative — it wraps arbitrary
 * children without trapping focus or claiming a landmark role.
 */
export function CRTFrame({
  children,
  glow = "phosphor",
  className,
  ...props
}: CRTFrameProps) {
  const glowKey = glow;

  return (
    <div className={cn(bezelVariants({ glow: glowKey }), className)} {...props}>
      {/* Corner screws — purely decorative tube-housing detail. */}
      <span
        aria-hidden
        className="absolute left-[10px] top-[10px] h-[7px] w-[7px] rounded-full bg-[var(--vhs-ground)] shadow-[inset_0_0_0_1px_rgba(242,234,214,0.18)]"
      />
      <span
        aria-hidden
        className="absolute right-[10px] top-[10px] h-[7px] w-[7px] rounded-full bg-[var(--vhs-ground)] shadow-[inset_0_0_0_1px_rgba(242,234,214,0.18)]"
      />
      <span
        aria-hidden
        className="absolute bottom-[10px] left-[10px] h-[7px] w-[7px] rounded-full bg-[var(--vhs-ground)] shadow-[inset_0_0_0_1px_rgba(242,234,214,0.18)]"
      />
      <span
        aria-hidden
        className="absolute bottom-[10px] right-[10px] h-[7px] w-[7px] rounded-full bg-[var(--vhs-ground)] shadow-[inset_0_0_0_1px_rgba(242,234,214,0.18)]"
      />

      {/* Inner screen: ground base, amplified scanlines, glowing phosphor border. */}
      <div
        className={cn(
          "vhs-scanlines relative overflow-hidden rounded-[8px] border bg-[var(--vhs-ground)]",
          GLOW_CLASS[glowKey],
        )}
        style={{
          // Amplify the scanlines relative to the page-level default (0.18).
          ["--vhs-scanline-opacity" as string]: "0.28",
          borderColor: GLOW_BORDER[glowKey],
        }}
      >
        {/* Power LED — decorative status dot. */}
        <span
          aria-hidden
          className="absolute right-[12px] top-[12px] z-[2] h-[6px] w-[6px] rounded-full"
          style={{
            backgroundColor: GLOW_BORDER[glowKey],
            boxShadow: `0 0 8px ${GLOW_BORDER[glowKey]}`,
          }}
        />
        <div className="relative z-[1] p-6">{children}</div>
      </div>
    </div>
  );
}
