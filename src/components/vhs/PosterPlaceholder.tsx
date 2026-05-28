import * as React from "react";
import { cn } from "@/lib/utils";

export type PosterHue = "magenta" | "acid" | "sodium" | "phosphor" | "cream";
export type PosterMotif =
  | "circle"
  | "grid"
  | "triangle"
  | "silhouette"
  | "bars"
  | "spool"
  | "mesh";

interface Palette {
  bg: string;
  band: string;
  text: string;
  accent: string;
  stripe: string;
}

const PALETTES: Record<PosterHue, Palette> = {
  magenta: {
    bg: "#3a0d1a",
    band: "#ff2e6e",
    text: "#f2ead6",
    accent: "#4afff0",
    stripe: "#ff4530",
  },
  acid: {
    bg: "#1c2207",
    band: "#d6ff3e",
    text: "#0a0807",
    accent: "#ff2e6e",
    stripe: "#4afff0",
  },
  sodium: {
    bg: "#2a160a",
    band: "#ff8a3d",
    text: "#0a0807",
    accent: "#4afff0",
    stripe: "#f2ead6",
  },
  phosphor: {
    bg: "#062421",
    band: "#4afff0",
    text: "#0a0807",
    accent: "#ff2e6e",
    stripe: "#d6ff3e",
  },
  cream: {
    bg: "#15120f",
    band: "#e8dfc4",
    text: "#0a0807",
    accent: "#ff2e6e",
    stripe: "#ff8a3d",
  },
};

export interface PosterPlaceholderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  hue?: PosterHue;
  motif?: PosterMotif;
  catalog?: string;
  showRentalSticker?: boolean;
}

export function PosterPlaceholder({
  title,
  subtitle,
  hue = "magenta",
  motif = "circle",
  catalog = "MRM-00000",
  showRentalSticker = true,
  className,
  ...props
}: PosterPlaceholderProps) {
  const p = PALETTES[hue];
  const stripeId = `vhs-stripe-${hue}-${React.useId()}`;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden border-2 border-[var(--vhs-ground)]",
        "shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]",
        className,
      )}
      style={{ aspectRatio: "2 / 3", background: p.bg }}
      {...props}
    >
      {subtitle ? (
        <div
          className="absolute inset-x-0 top-0 flex items-baseline justify-between gap-2 border-b-2 border-[var(--vhs-ground)] px-[10px] py-[6px]"
          style={{ background: p.band }}
        >
          <span
            className="vhs-kicker text-[0.72rem]"
            style={{ color: p.text }}
          >
            {subtitle}
          </span>
          <span
            className="vhs-mono text-[0.55rem] opacity-70"
            style={{ color: p.text }}
          >
            {catalog}
          </span>
        </div>
      ) : null}

      <svg
        viewBox="0 0 200 300"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern
            id={stripeId}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={p.stripe}
              strokeWidth="0.5"
              opacity="0.18"
            />
          </pattern>
        </defs>
        <rect
          x="0"
          y="32"
          width="200"
          height="268"
          fill={`url(#${stripeId})`}
        />
        <MotifShape motif={motif} palette={p} />
      </svg>

      <div
        className="absolute inset-x-0 bottom-0 px-3 pt-6 pb-2"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.9) 65%, transparent)",
        }}
      >
        <div
          className="vhs-display text-2xl"
          style={{
            color: "var(--vhs-cream)",
            textShadow: `2px 2px 0 ${p.band}, 3px 3px 0 var(--vhs-ground)`,
          }}
        >
          {title}
        </div>
      </div>

      {showRentalSticker ? (
        <div
          className="vhs-kicker absolute top-[38px] -right-[18px] rotate-[35deg] border border-[var(--vhs-ground)] px-[22px] py-[3px] text-[0.6rem]"
          style={{ background: p.accent, color: "var(--vhs-ground)" }}
        >
          RENTAL
        </div>
      ) : null}
    </div>
  );
}

function MotifShape({
  motif,
  palette: p,
}: {
  motif: PosterMotif;
  palette: Palette;
}) {
  if (motif === "circle") {
    return (
      <>
        <circle
          cx="100"
          cy="160"
          r="68"
          fill="none"
          stroke={p.band}
          strokeWidth="2"
          opacity="0.7"
        />
        <circle cx="100" cy="160" r="48" fill={p.accent} opacity="0.5" />
        <circle cx="100" cy="160" r="28" fill={p.band} />
        <rect x="20" y="232" width="160" height="2" fill={p.accent} />
      </>
    );
  }
  if (motif === "grid") {
    return (
      <>
        <g stroke={p.band} strokeWidth="1" opacity="0.6" fill="none">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={70 + i * 22}
              x2="200"
              y2={50 + i * 22}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={20 + i * 32}
              y1="60"
              x2={10 + i * 32}
              y2="240"
            />
          ))}
        </g>
        <rect x="60" y="120" width="80" height="60" fill={p.accent} opacity="0.85" />
      </>
    );
  }
  if (motif === "triangle") {
    return (
      <>
        <polygon points="100,80 160,220 40,220" fill={p.band} opacity="0.85" />
        <polygon
          points="100,120 140,210 60,210"
          fill={p.accent}
          opacity="0.7"
        />
        <rect x="0" y="230" width="200" height="4" fill={p.band} />
        <rect x="0" y="238" width="200" height="2" fill={p.accent} />
      </>
    );
  }
  if (motif === "silhouette") {
    return (
      <>
        <rect x="50" y="90" width="100" height="130" fill={p.band} opacity="0.4" />
        <polygon points="60,220 100,90 140,220" fill={p.accent} />
        <circle cx="100" cy="120" r="14" fill={p.band} />
      </>
    );
  }
  if (motif === "bars") {
    return (
      <>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={20 + i * 24}
            y={90 + Math.abs(3 - i) * 12}
            width="16"
            height={140 - Math.abs(3 - i) * 12}
            fill={p.band}
            opacity={0.45 + i * 0.07}
          />
        ))}
      </>
    );
  }
  if (motif === "spool") {
    return (
      <>
        <rect
          x="30"
          y="100"
          width="140"
          height="92"
          fill="none"
          stroke={p.band}
          strokeWidth="2"
          opacity="0.85"
        />
        <rect
          x="44"
          y="120"
          width="112"
          height="52"
          fill={p.accent}
          opacity="0.2"
          stroke={p.band}
          strokeWidth="1"
        />
        <rect x="60" y="142" width="80" height="8" fill={p.band} opacity="0.55" />
        {[74, 126].map((cx, ri) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy="146"
              r="22"
              fill="none"
              stroke={p.band}
              strokeWidth="2"
            />
            <circle
              cx={cx}
              cy="146"
              r="15"
              fill="none"
              stroke={p.band}
              strokeWidth="1.2"
              opacity="0.75"
            />
            <circle cx={cx} cy="146" r="9" fill={p.accent} />
            <circle cx={cx} cy="146" r="3" fill={p.band} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i * Math.PI) / 3 + (ri === 1 ? 0.4 : 0);
              return (
                <line
                  key={i}
                  x1={cx + Math.cos(a) * 9}
                  y1={146 + Math.sin(a) * 9}
                  x2={cx + Math.cos(a) * 22}
                  y2={146 + Math.sin(a) * 22}
                  stroke={p.band}
                  strokeWidth="1.2"
                  opacity="0.8"
                />
              );
            })}
          </g>
        ))}
        <g fill={p.band} opacity="0.7">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={48 + i * 18} y="108" width="6" height="4" />
          ))}
        </g>
        <rect
          x="44"
          y="178"
          width="112"
          height="6"
          fill={p.band}
          opacity="0.6"
        />
      </>
    );
  }
  if (motif === "mesh") {
    return (
      <>
        <g stroke={p.band} strokeWidth="1.2" fill="none" opacity="0.95">
          <polygon points="100,80 40,140 100,160" fill={p.accent} opacity="0.4" />
          <polygon points="100,80 160,140 100,160" fill={p.band} opacity="0.18" />
          <polygon points="40,140 60,210 100,160" fill={p.band} opacity="0.25" />
          <polygon points="160,140 140,210 100,160" fill={p.accent} opacity="0.28" />
          <polygon points="60,210 100,250 100,160" fill={p.band} opacity="0.32" />
          <polygon points="140,210 100,250 100,160" fill={p.accent} opacity="0.22" />
          <polyline points="100,80 40,140 60,210 100,250 140,210 160,140 100,80" />
          <line x1="100" y1="80" x2="100" y2="160" />
          <line x1="40" y1="140" x2="100" y2="160" />
          <line x1="160" y1="140" x2="100" y2="160" />
          <line x1="60" y1="210" x2="100" y2="160" />
          <line x1="140" y1="210" x2="100" y2="160" />
          <line x1="100" y1="250" x2="100" y2="160" />
        </g>
        <g fill={p.band}>
          {[
            [100, 80],
            [40, 140],
            [160, 140],
            [60, 210],
            [140, 210],
            [100, 160],
            [100, 250],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" />
          ))}
        </g>
      </>
    );
  }
  return null;
}
