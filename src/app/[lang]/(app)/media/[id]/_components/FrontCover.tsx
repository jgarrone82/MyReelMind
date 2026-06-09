import Image from "next/image";
import { GenreSticker, PosterPlaceholder } from "@/components/vhs";

interface FrontCoverProps {
  title: string;
  posterUrl?: string | null;
  catalog: string;
  newArrivalLabel?: string;
}

export function FrontCover({
  title,
  posterUrl,
  catalog,
  newArrivalLabel,
}: FrontCoverProps) {
  return (
    <div className="relative border-l border-dashed border-[rgba(10,8,7,0.35)] bg-[var(--vhs-ground)] p-0">
      {posterUrl ? (
        <div
          className="relative w-full overflow-hidden border-2 border-[var(--vhs-ground)] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]"
          style={{ aspectRatio: "2 / 3" }}
        >
          <Image
            src={posterUrl}
            alt={`${title} poster`}
            fill
            priority
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <PosterPlaceholder
          title={title}
          hue="magenta"
          motif="circle"
          catalog={catalog}
          showRentalSticker={false}
        />
      )}

      {newArrivalLabel ? (
        <GenreSticker
          hue="acid"
          rotate="nr"
          className="absolute top-3 -left-[10px] z-10 !text-[0.78rem]"
        >
          ★ {newArrivalLabel}
        </GenreSticker>
      ) : null}
    </div>
  );
}
