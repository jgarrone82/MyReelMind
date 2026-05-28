import { Barcode, GenreSticker, SourceBadge } from "@/components/vhs";
import type {
  GenreStickerHue,
  SourceBadgeColor,
} from "@/components/vhs";
import { SpecsReceipt } from "./SpecsReceipt";

interface SpecsConfig {
  heading: string;
  catalog: { label: string; value: string };
  year?: { label: string; value: string | number } | null;
  source: { label: string; value: string };
  score?: { label: string; value: string } | null;
  episodes?: { label: string; value: string | number } | null;
  format: { label: string; value: string };
}

interface BackCoverProps {
  description?: string | null;
  genres: string[];
  source: { label: string; color: SourceBadgeColor };
  backCoverLabel: string;
  synopsisLabel: string;
  beKindRewindLabel: string;
  specs: SpecsConfig;
  barcodeSeed: string;
  barcodeUpc?: string;
}

const STICKER_HUES: GenreStickerHue[] = [
  "magenta",
  "phosphor",
  "cream",
  "sodium",
  "acid",
];
const STICKER_ROTATIONS = ["sl", "sr", "nl", "nr"] as const;

function pickHue(index: number): GenreStickerHue {
  return STICKER_HUES[index % STICKER_HUES.length]!;
}

function pickRotate(index: number) {
  return STICKER_ROTATIONS[index % STICKER_ROTATIONS.length];
}

export function BackCover({
  description,
  genres,
  source,
  backCoverLabel,
  synopsisLabel,
  beKindRewindLabel,
  specs,
  barcodeSeed,
  barcodeUpc,
}: BackCoverProps) {
  return (
    <div className="relative flex flex-col gap-[18px] p-7 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-[var(--vhs-ground)] pb-[10px]">
        <div className="vhs-kicker text-[0.8rem] text-[var(--vhs-ground)] opacity-70">
          {backCoverLabel} · Side A · Track 1
        </div>
        <SourceBadge color={source.color} label={source.label} />
      </div>

      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-[14px] pt-1">
          {genres.map((genre, i) => (
            <GenreSticker key={genre} hue={pickHue(i)} rotate={pickRotate(i)}>
              {genre}
            </GenreSticker>
          ))}
        </div>
      ) : null}

      {description ? (
        <>
          <div className="vhs-kicker flex items-center justify-between border-t-2 border-[var(--vhs-ground)] pt-2 text-[0.78rem] text-[var(--vhs-ground)]">
            <span>{synopsisLabel}</span>
            <span className="opacity-60">Side A · Track 1</span>
          </div>
          <div className="vhs-mono text-pretty text-[0.95rem] leading-relaxed text-[var(--vhs-ground)] sm:columns-2 sm:gap-7 sm:[column-rule:1px_dashed_rgba(10,8,7,0.3)]">
            <p className="m-0 break-inside-avoid">{description}</p>
          </div>
        </>
      ) : null}

      <div className="vhs-script -mt-1 inline-block rotate-[-3deg] text-[1.25rem] text-[var(--vhs-magenta)]">
        {beKindRewindLabel}
      </div>

      <div className="border-t-2 border-[var(--vhs-ground)] pt-[14px]">
        <SpecsReceipt {...specs} />
      </div>

      <div className="grid grid-cols-1 gap-[18px] border-t-2 border-[var(--vhs-ground)] pt-[14px] sm:grid-cols-[1fr_minmax(180px,auto)]">
        <div />
        <div>
          <Barcode seed={barcodeSeed} />
          {barcodeUpc ? (
            <div className="vhs-mono mt-1 text-center text-[0.7rem] tracking-widest text-[var(--vhs-ground)]">
              {barcodeUpc}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
