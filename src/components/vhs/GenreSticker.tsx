import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const stickerVariants = cva(
  "vhs-kicker inline-block whitespace-nowrap border-2 border-[var(--vhs-ground)] px-2 pt-1 pb-0.5 text-xs leading-none shadow-[3px_3px_0_var(--vhs-ground)]",
  {
    variants: {
      hue: {
        magenta: "bg-[var(--vhs-magenta)] text-[var(--vhs-cream)]",
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
