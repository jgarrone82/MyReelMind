import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { GenreSticker, type GenreStickerHue } from "./GenreSticker";
import {
  PosterPlaceholder,
  type PosterHue,
  type PosterMotif,
} from "./PosterPlaceholder";

export interface VHSBoxCardProps {
  title: string;
  year?: string | number;
  catalog?: string;
  rating?: string;
  aspectInfo?: string;
  posterUrl?: string;
  posterAlt?: string;
  hue?: PosterHue;
  motif?: PosterMotif;
  badge?: { label: string; color?: GenreStickerHue };
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}

export function VHSBoxCard({
  title,
  year,
  catalog,
  rating = "R",
  aspectInfo = "1.85",
  posterUrl,
  posterAlt,
  hue = "magenta",
  motif = "circle",
  badge,
  href,
  onClick,
  className,
}: VHSBoxCardProps) {
  const catalogTail = catalog?.slice(-4) ?? "00A1";

  const body = (
    <article
      className={cn(
        "relative block w-full cursor-pointer border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] text-left",
        "shadow-[5px_5px_0_rgba(0,0,0,0.8)]",
        "transition-transform duration-[110ms] ease-[cubic-bezier(0.3,0,0.7,1)]",
        "hover:-translate-y-1 hover:rotate-[-2deg]",
        "focus-visible:-translate-y-1 focus-visible:rotate-[-2deg] focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex h-7 items-center gap-2 border-b-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-3)] px-[10px]">
        <span className="inline-block h-4 w-1 bg-[var(--vhs-magenta)]" />
        <span className="vhs-kicker truncate text-[0.78rem] text-[var(--vhs-cream)]">
          {title}
        </span>
      </div>

      <div className="relative">
        {posterUrl ? (
          <div
            className="relative w-full overflow-hidden border-2 border-[var(--vhs-ground)] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]"
            style={{ aspectRatio: "2 / 3" }}
          >
            <Image
              src={posterUrl}
              alt={posterAlt ?? title}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <PosterPlaceholder
            title={title}
            subtitle={typeof year === "number" ? String(year) : year}
            hue={hue}
            motif={motif}
            catalog={catalog}
          />
        )}
      </div>

      <div className="vhs-mono flex justify-between border-t-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] px-[10px] py-2 text-[0.7rem] text-[var(--vhs-cream-dim)]">
        <span>{year ?? "—"}</span>
        <span>
          {rating} · {aspectInfo}
        </span>
        <span>{catalogTail}</span>
      </div>

      {badge ? (
        <GenreSticker
          hue={badge.color ?? "acid"}
          rotate="sr"
          className="absolute -right-2 top-[38px] !text-[0.6rem]"
        >
          {badge.label}
        </GenreSticker>
      ) : null}
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={title}
        className="block focus:outline-none"
      >
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        className="block w-full bg-transparent p-0 text-left"
      >
        {body}
      </button>
    );
  }

  return body;
}
