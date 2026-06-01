import { describe, it, expect } from "vitest";
import {
  deriveCatalog,
  deriveUpc,
  hueFromGenre,
  motifFromType,
  mediaToCardProps,
} from "./vhs-cosmetics";
import type { UserMediaWithMedia } from "@/lib/dashboard/types";

/**
 * Builds a UserMediaWithMedia row with a media item, overriding only what a test
 * cares about. Mirrors the real Drizzle select shape closely enough for the
 * cosmetic mapping (it only touches mediaItem fields + ids).
 */
function makeRow(
  overrides: Partial<UserMediaWithMedia["mediaItem"]> = {},
  rowOverrides: Partial<UserMediaWithMedia> = {}
): UserMediaWithMedia {
  return {
    id: "um-1",
    userId: "user-1",
    mediaItemId: "mi-1",
    status: "watching",
    progress: 0,
    rating: null,
    notes: null,
    dates: null,
    createdAt: new Date("2026-05-30T00:00:00Z"),
    updatedAt: new Date("2026-05-31T00:00:00Z"),
    mediaItem: {
      id: "mi-1",
      source: "tmdb",
      sourceId: "603",
      type: "movie",
      title: "The Matrix",
      originalTitle: null,
      overview: null,
      overviews: null,
      releaseDate: "1999",
      posterPath: "https://image.tmdb.org/t/p/w500/poster.jpg",
      backdropPath: null,
      genres: ["Action", "Sci-Fi"],
      runtime: 136,
      status: null,
      rawData: null,
      fetchedAt: new Date("2026-05-29T00:00:00Z"),
      createdAt: new Date("2026-05-29T00:00:00Z"),
      ...overrides,
    } as UserMediaWithMedia["mediaItem"],
    ...rowOverrides,
  } as UserMediaWithMedia;
}

describe("vhs-cosmetics", () => {
  describe("deriveCatalog", () => {
    it("mirrors the detail-page algorithm: strips non-digits, pads to 5, MRM-#####-A", () => {
      expect(deriveCatalog("tmdb-603")).toEqual({
        full: "MRM-00603-A",
        padded: "00603",
        sub: "00603",
      });
    });

    it("is deterministic for the same id", () => {
      expect(deriveCatalog("anilist-21")).toEqual(deriveCatalog("anilist-21"));
    });

    it("handles ids with no digits", () => {
      expect(deriveCatalog("abc").padded).toBe("00000");
    });

    it("truncates long all-digit ids to a fixed 5-digit card width", () => {
      // A uuid yields many digits; the card number must stay 5 digits, not a
      // long string shown verbatim. Deterministic: last 5 digits.
      const uuid = "123e4567-e89b-12d3-a456-426614174000";
      const { padded, full } = deriveCatalog(uuid);
      expect(padded).toHaveLength(5);
      expect(padded).toBe("74000");
      expect(full).toBe("MRM-74000-A");
    });
  });

  describe("deriveUpc", () => {
    it("mirrors the detail-page UPC grouping", () => {
      expect(deriveUpc("tmdb-603")).toBe("0 00000 00060 3");
    });

    it("is deterministic", () => {
      expect(deriveUpc("tmdb-12345")).toBe(deriveUpc("tmdb-12345"));
    });
  });

  describe("hueFromGenre", () => {
    it("returns a valid PosterHue deterministically from the first genre", () => {
      const a = hueFromGenre(["Action", "Sci-Fi"]);
      const b = hueFromGenre(["Action", "Sci-Fi"]);
      expect(a).toBe(b);
      expect(["magenta", "acid", "sodium", "phosphor", "cream"]).toContain(a);
    });

    it("falls back to a valid hue when genres are missing or empty", () => {
      expect(["magenta", "acid", "sodium", "phosphor", "cream"]).toContain(
        hueFromGenre(null)
      );
      expect(["magenta", "acid", "sodium", "phosphor", "cream"]).toContain(
        hueFromGenre([])
      );
    });

    it("varies the hue across different genres", () => {
      const hues = new Set(
        ["Action", "Comedy", "Drama", "Horror", "Romance", "Documentary"].map(
          (g) => hueFromGenre([g])
        )
      );
      // Deterministic spread should not collapse every genre to one hue.
      expect(hues.size).toBeGreaterThan(1);
    });
  });

  describe("motifFromType", () => {
    it("maps each media type to a valid, deterministic PosterMotif", () => {
      const motifs = [
        "circle",
        "grid",
        "triangle",
        "silhouette",
        "bars",
        "spool",
        "mesh",
      ];
      expect(motifs).toContain(motifFromType("movie"));
      expect(motifs).toContain(motifFromType("tv"));
      expect(motifs).toContain(motifFromType("anime"));
      expect(motifFromType("movie")).toBe(motifFromType("movie"));
    });
  });

  describe("mediaToCardProps", () => {
    it("builds title, year, posterUrl and a locale-prefixed detail href", () => {
      const props = mediaToCardProps(makeRow(), "en");
      expect(props.title).toBe("The Matrix");
      expect(props.year).toBe("1999");
      expect(props.posterUrl).toBe(
        "https://image.tmdb.org/t/p/w500/poster.jpg"
      );
      expect(props.href).toBe("/en/media/tmdb-603");
    });

    it("derives the catalog cosmetically from the public id", () => {
      const props = mediaToCardProps(makeRow(), "en");
      expect(props.catalog).toBe("MRM-00603-A");
    });

    it("respects the active locale in the href", () => {
      const props = mediaToCardProps(makeRow(), "es");
      expect(props.href).toBe("/es/media/tmdb-603");
    });

    it("omits posterUrl when posterPath is absent (falls back to placeholder)", () => {
      const props = mediaToCardProps(makeRow({ posterPath: null }), "en");
      expect(props.posterUrl).toBeUndefined();
    });

    it("omits year when releaseDate is absent", () => {
      const props = mediaToCardProps(makeRow({ releaseDate: null }), "en");
      expect(props.year).toBeUndefined();
    });

    it("provides a valid hue and motif even when genres are missing", () => {
      const props = mediaToCardProps(makeRow({ genres: null }), "en");
      expect(["magenta", "acid", "sodium", "phosphor", "cream"]).toContain(
        props.hue
      );
      expect([
        "circle",
        "grid",
        "triangle",
        "silhouette",
        "bars",
        "spool",
        "mesh",
      ]).toContain(props.motif);
    });

    it("does NOT expose a progress prop (honest-data: no fabricated progress %)", () => {
      const props = mediaToCardProps(makeRow(), "en");
      expect("progress" in props).toBe(false);
    });

    it("is deterministic for the same row", () => {
      const a = mediaToCardProps(makeRow(), "en");
      const b = mediaToCardProps(makeRow(), "en");
      expect(a).toEqual(b);
    });

    it("returns href undefined (no link) when the media item is missing", () => {
      // The detail route only resolves public ids (tmdb-/anilist-). Falling
      // back to the internal uuid would 404, so the card must render linkless.
      const row = makeRow({}, { mediaItem: null });
      const props = mediaToCardProps(row, "en");
      expect(props.href).toBeUndefined();
      // Cosmetic fallbacks still resolve.
      expect(props.title).toBe("Unknown");
      expect(["magenta", "acid", "sodium", "phosphor", "cream"]).toContain(
        props.hue
      );
      expect([
        "circle",
        "grid",
        "triangle",
        "silhouette",
        "bars",
        "spool",
        "mesh",
      ]).toContain(props.motif);
    });
  });
});
