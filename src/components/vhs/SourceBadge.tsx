import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "vhs-mono inline-block whitespace-nowrap border-[1.5px] border-[var(--vhs-ground)] px-2 pt-[3px] pb-[2px] text-[0.65rem] font-semibold tracking-wider text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]",
  {
    variants: {
      color: {
        magenta: "bg-[var(--vhs-magenta)]",
        phosphor: "bg-[var(--vhs-phosphor)]",
        acid: "bg-[var(--vhs-acid)]",
        sodium: "bg-[var(--vhs-sodium)]",
      },
    },
    defaultVariants: { color: "magenta" },
  },
);

export type SourceBadgeColor = NonNullable<
  VariantProps<typeof badgeVariants>["color"]
>;

export interface SourceBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {
  label: string;
}

export function SourceBadge({
  color,
  label,
  className,
  ...props
}: SourceBadgeProps) {
  return (
    <span className={cn(badgeVariants({ color }), className)} {...props}>
      {label}
    </span>
  );
}
