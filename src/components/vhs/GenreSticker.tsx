import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stickerVariants = cva(
  "vhs-kicker inline-block whitespace-nowrap border-2 border-[var(--vhs-ground)] px-2 pt-1 pb-0.5 text-xs leading-none shadow-[3px_3px_0_var(--vhs-ground)]",
  {
    variants: {
      hue: {
        // Deep-ink text on neon magenta (#0a0807 on #ff2e6e ≈ 5.58:1) clears
        // WCAG AA. Cream-on-magenta was ~2.98:1 and failed AA — mirrors the
        // .vhs-btn fix in issue #45. The neon background token is unchanged.
        magenta: "bg-[var(--vhs-magenta)] text-[var(--vhs-ground)]",
        acid: "bg-[var(--vhs-acid)] text-[var(--vhs-ground)]",
        sodium: "bg-[var(--vhs-sodium)] text-[var(--vhs-ground)]",
        phosphor: "bg-[var(--vhs-phosphor)] text-[var(--vhs-ground)]",
        cream: "bg-[var(--vhs-cream)] text-[var(--vhs-ground)]",
        ground:
          "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream)] shadow-[3px_3px_0_var(--vhs-magenta)]",
      },
      rotate: {
        none: "rotate-0",
        nl: "rotate-[-4deg]",
        sl: "rotate-[-2deg]",
        sr: "rotate-[2deg]",
        nr: "rotate-[4deg]",
      },
    },
    defaultVariants: { hue: "magenta", rotate: "sl" },
  },
);

export type GenreStickerHue = NonNullable<
  VariantProps<typeof stickerVariants>["hue"]
>;
export type GenreStickerRotate = NonNullable<
  VariantProps<typeof stickerVariants>["rotate"]
>;

export interface GenreStickerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof stickerVariants> {
  children: React.ReactNode;
}

export function GenreSticker({
  hue,
  rotate,
  className,
  children,
  ...props
}: GenreStickerProps) {
  return (
    <span
      className={cn(stickerVariants({ hue, rotate }), className)}
      {...props}
    >
      {children}
    </span>
  );
}
