import * as React from "react";
import { cn } from "@/lib/utils";

export interface BarcodeProps extends React.HTMLAttributes<HTMLDivElement> {
  seed?: string;
  bars?: number;
  height?: number;
}

function deterministicWidths(seed: string, count: number): number[] {
  let n = 0;
  for (let i = 0; i < seed.length; i++) {
    n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const widths: number[] = [];
  for (let i = 0; i < count; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    widths.push(1 + (n % 4));
  }
  return widths;
}

export function Barcode({
  seed = "VHS",
  bars = 64,
  height = 32,
  className,
  ...props
}: BarcodeProps) {
  const widths = React.useMemo(
    () => deterministicWidths(seed, bars),
    [seed, bars],
  );
  return (
    <div
      aria-hidden
      className={cn("flex items-end gap-[1px]", className)}
      style={{ height }}
      {...props}
    >
      {widths.map((w, i) => (
        <i
          key={i}
          className="block bg-[var(--vhs-ground)]"
          style={{
            width: w,
            height: "100%",
            opacity: i % 7 === 0 ? 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}
