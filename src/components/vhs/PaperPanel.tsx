import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const paperVariants = cva(
  "relative border-2 border-[var(--vhs-ground)] bg-[var(--vhs-paper)] text-[var(--vhs-ground)]",
  {
    variants: {
      tilt: {
        none: "",
        left: "rotate-[-0.4deg]",
        right: "rotate-[0.4deg]",
        leftHard: "rotate-[-1.5deg]",
        rightHard: "rotate-[1.5deg]",
      },
      shadow: {
        none: "",
        sm: "shadow-[4px_4px_0_rgba(0,0,0,0.65)]",
        md: "shadow-[8px_8px_0_rgba(0,0,0,0.75)]",
        lg: "shadow-[12px_12px_0_rgba(0,0,0,0.8)]",
      },
      perforated: {
        none: "",
        top: "border-t-0 before:absolute before:inset-x-0 before:-top-[2px] before:h-[2px] before:border-t-[3px] before:border-dashed before:border-[var(--vhs-ground)]",
      },
    },
    defaultVariants: { tilt: "none", shadow: "md", perforated: "none" },
  },
);

export interface PaperPanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof paperVariants> {
  children: React.ReactNode;
}

export function PaperPanel({
  tilt,
  shadow,
  perforated,
  className,
  children,
  ...props
}: PaperPanelProps) {
  return (
    <div
      className={cn(paperVariants({ tilt, shadow, perforated }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
