import type { PosterHue, PosterMotif } from "@/components/vhs";
import type { VHSBoxCardProps } from "@/components/vhs";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";
import { formatPublicId } from "./formatPublicId";

/**
 * VHS cosmetic derivations shared by the dashboard cards and (eventually) the
 * detail page. These produce DECORATIVE values — a fake catalog number, a UPC,
 * a poster hue/motif — derived deterministically from real identifiers. They
 * never fabricate a real datum (#800 / #853 honest-data principle).
 *
 * The catalog/UPC algorithms intentionally MIRROR the logic currently inlined in
 * src/app/[lang]/media/[id]/page.tsx so output stays consistent across screens.
 * A future cleanup will dedupe the detail page onto these helpers.
 */

/** Derive the cosmetic catalog number from a media id (public id or any string). */
export function deriveCatalog(id: string): {
  full: string;
  padded: string;
  sub: string;
} {
  const numeric = id.replace(/\D/g, "");
  const padded = numeric.padStart(5, "0");
  return {
    full: `MRM-${padded}-A`,
    padded,
    sub: padded,
  };
}

/** Derive the cosmetic UPC string from a media id. */
export function deriveUpc(id: string): string {
  const numeric = id.replace(/\D/g, "").padStart(11, "0");
  return `0 ${numeric.slice(0, 5)} ${numeric.slice(5, 10)} ${numeric.slice(10) || "0"}`;
}

const POSTER_HUES: PosterHue[] = [
  "magenta",
  "acid",
  "sodium",
  "phosphor",
  "cream",
];

const TYPE_MOTIF: Record<"movie" | "tv" | "anime", PosterMotif> = {
  movie: "circle",
  tv: "grid",
  anime: "mesh",
};

/** Stable, order-independent string hash (FNV-1a-ish) → non-negative int. */
function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Deterministically map a genre list to a PosterHue. Uses the first genre so a
 * title's accent stays stable as its genre list grows; falls back to a hashed
 * default when no genre is present.
 */
export function hueFromGenre(genres: string[] | null | undefined): PosterHue {
  const seed = genres && genres.length > 0 ? genres[0] : "untagged";
  return POSTER_HUES[hashString(seed) % POSTER_HUES.length];
}

/** Deterministically map a media type to a PosterMotif. */
export function motifFromType(
  type: "movie" | "tv" | "anime"
): PosterMotif {
  return TYPE_MOTIF[type] ?? "circle";
}

/**
 * Map a UserMediaWithMedia row to VHSBoxCard props for a dashboard shelf.
 *
 * - title / year / posterUrl come from the real media item.
 * - catalog / hue / motif are cosmetic, derived deterministically.
 * - href points at the media detail page using the composite public id
 *   (`tmdb-603` / `anilist-21`) — NOT the internal uuid, which the detail route
 *   cannot resolve. Always locale-prefixed.
 * - NO progress prop (honest-data: progress is an episode count with no
 *   persisted total, so there is no honest % to show).
 */
export function mediaToCardProps(
  item: UserMediaWithMedia,
  lang: string
): VHSBoxCardProps {
  const media = item.mediaItem;
  const title = media?.title ?? "Unknown";
  const publicId = media
    ? formatPublicId(media.source, media.sourceId)
    : item.mediaItemId;
  const catalog = deriveCatalog(publicId).full;

  return {
    title,
    year: media?.releaseDate ?? undefined,
    posterUrl: media?.posterPath ?? undefined,
    catalog,
    hue: hueFromGenre(media?.genres),
    motif: motifFromType(media?.type ?? "movie"),
    href: `/${lang}/media/${publicId}`,
  };
}
