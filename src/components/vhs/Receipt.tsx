import * as React from "react";
import { cn } from "@/lib/utils";

export interface ReceiptRow {
  label: string;
  value: string;
}

export interface ReceiptProps extends React.HTMLAttributes<HTMLDivElement> {
  rows: ReceiptRow[];
  heading?: string;
  footer?: React.ReactNode;
}

export function Receipt({
  rows,
  heading,
  footer,
  className,
  ...props
}: ReceiptProps) {
  return (
    <div
      className={cn(
        "vhs-mono border-[1.5px] border-[var(--vhs-ground)] bg-[var(--vhs-paper)] px-[10px] py-2 text-[var(--vhs-ground)]",
        className,
      )}
      {...props}
    >
      {heading ? (
        <div className="vhs-kicker mb-2 text-[0.72rem]">{heading}</div>
      ) : null}
      <div className="text-[0.78rem]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between border-b border-dashed border-[rgba(10,8,7,0.3)] py-[3px] last:border-b-0"
          >
            <span className="opacity-70">{row.label}</span>
            <span className="font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
