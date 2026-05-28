import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/server";
import { fetchMediaDetail } from "@/lib/media/detail";
import { db } from "@/db";
import { mediaItems, userMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getDictionary, type Locale } from "@/i18n";
import { MediaDetailClient } from "@/components/collection/MediaDetailClient";
import type { WatchStatus } from "@/components/collection/StatusSelector";
import { addToLibrary } from "@/actions/collection";
import { MembersOnlyPanel } from "@/components/vhs";
import type { SourceBadgeColor } from "@/components/vhs";
import { UnfoldedVHS } from "./_components/UnfoldedVHS";
import { BackCover } from "./_components/BackCover";
import { Spine } from "./_components/Spine";
import { FrontCover } from "./_components/FrontCover";

interface MediaDetailPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: MediaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const media = await fetchMediaDetail(id);

  if (!media) {
    return { title: "Media Not Found" };
  }

  return {
    title: `${media.title ?? "Unknown"} — MyReelMind`,
    description: media.description ?? undefined,
    openGraph: media.coverImage
      ? { images: [{ url: media.coverImage }] }
      : undefined,
  };
}

function sourceColor(source: "tmdb" | "anilist"): SourceBadgeColor {
  return source === "tmdb" ? "magenta" : "phosphor";
}

function deriveCatalog(id: string): { full: string; padded: string; sub: string } {
  const numeric = id.replace(/\D/g, "");
  const padded = numeric.padStart(5, "0");
  return {
    full: `MRM-${padded}-A`,
    padded,
    sub: padded,
  };
}

function deriveUpc(id: string): string {
  const numeric = id.replace(/\D/g, "").padStart(11, "0");
  return `0 ${numeric.slice(0, 5)} ${numeric.slice(5, 10)} ${numeric.slice(10) || "0"}`;
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { lang, id: mediaId } = await params;
  const media = await fetchMediaDetail(mediaId);

  if (!media) {
    notFound();
  }

  const session = await getSession();
  let userEntry = null;

  if (session) {
    const mediaItemRecord = await db.query.mediaItems.findFirst({
      where: and(
        eq(mediaItems.source, media.source),
        eq(
          mediaItems.sourceId,
          media.source === "tmdb"
            ? mediaId.replace("tmdb-", "")
            : mediaId.replace("anilist-", ""),
        ),
      ),
    });

    if (mediaItemRecord) {
      userEntry = await db.query.userMedia.findFirst({
        where: and(
          eq(userMedia.userId, session.user.id),
          eq(userMedia.mediaItemId, mediaItemRecord.id),
        ),
      });
    }
  }

  const dict = await getDictionary(lang as Locale);

  const sourceLabel = media.source.toUpperCase();
  const typeLabel =
    media.type === "movie"
      ? dict.media.movie
      : media.type === "tv"
        ? dict.media.tv
        : dict.media.anime;
  const componentType = media.type === "movie" ? "movie" : media.type === "tv" ? "tv" : "anime";

  const catalog = deriveCatalog(mediaId);
  const upc = deriveUpc(mediaId);

  const titleText = media.title ?? "Unknown";

  return (
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] pb-24 text-[var(--vhs-cream)]">
      <section className="relative h-[44vh] min-h-[320px] w-full overflow-hidden border-b-2 border-[var(--vhs-ground-3)]">
        {media.bannerImage ? (
          <Image
            src={media.bannerImage}
            alt={`${titleText} backdrop`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--vhs-ground-3)] via-[var(--vhs-ground-2)] to-[var(--vhs-ground)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--vhs-ground)] via-[var(--vhs-ground)]/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <div className="vhs-kicker mb-2 text-[var(--vhs-acid)]">
            {typeLabel}
          </div>
          <h1
            className="vhs-display vhs-aberrate text-[clamp(2.5rem,8vw,6rem)] text-[var(--vhs-cream)]"
            style={{
              textShadow:
                "2px 0 0 var(--vhs-magenta), -2px 0 0 var(--vhs-phosphor), 4px 4px 0 var(--vhs-ground)",
            }}
          >
            {titleText}
          </h1>
          {media.originalTitle && media.originalTitle !== titleText ? (
            <div className="vhs-mono mt-2 text-[var(--vhs-cream-dim)]">
              {media.originalTitle}
            </div>
          ) : null}
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <UnfoldedVHS
          backCover={
            <BackCover
              description={media.description}
              genres={media.genres}
              source={{ label: sourceLabel, color: sourceColor(media.source) }}
              backCoverLabel={dict.media.detail.backCover}
              synopsisLabel={dict.media.detail.synopsis}
              beKindRewindLabel={dict.media.detail.beKindRewind}
              specs={{
                heading: dict.media.detail.specs,
                catalog: { label: dict.media.detail.catalogNo, value: catalog.full },
                year: media.year
                  ? { label: dict.media.detail.year, value: media.year }
                  : null,
                source: {
                  label: dict.media.detail.source,
                  value: `${sourceLabel}-${catalog.padded}`,
                },
                score: media.score
                  ? {
                      label: dict.media.detail.score,
                      value: `${(media.score / 10).toFixed(1)} / 10`,
                    }
                  : null,
                episodes: media.episodes
                  ? { label: dict.media.detail.episodes, value: media.episodes }
                  : null,
                format: { label: dict.media.detail.format, value: "VHS · NTSC" },
              }}
              barcodeSeed={mediaId}
              barcodeUpc={upc}
            />
          }
          spine={
            <Spine catalog="MRM" catalogSub={catalog.padded} />
          }
          frontCover={
            <FrontCover
              title={titleText}
              posterUrl={media.coverImage}
              catalog={catalog.full}
              newArrivalLabel={dict.media.stickers.new}
            />
          }
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {session ? (
          userEntry ? (
            <div className="mx-auto w-full max-w-[1200px] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-ground-2)] p-6 shadow-[8px_8px_0_rgba(0,0,0,0.85)] sm:p-8">
              <MediaDetailClient
                mediaId={mediaId}
                initialStatus={(userEntry?.status as WatchStatus) ?? "want_to_watch"}
                initialProgress={userEntry?.progress ?? 0}
                initialRating={userEntry?.rating ?? null}
                episodes={media.episodes ?? null}
                type={componentType}
                dict={{
                  collection: dict.library.collection,
                  status: dict.media.status,
                  statusLabel: dict.library.status,
                  progress: dict.library.progress,
                  episode: dict.media.episode,
                  chapter: dict.media.chapter,
                  of: dict.media.of,
                  rating: dict.library.rating,
                  yourRating: dict.library.yourRating,
                  notRated: dict.library.notRated,
                  clear: dict.common.delete,
                  markedCompleted: dict.library.markedCompleted,
                  statusUpdated: dict.library.statusUpdated,
                  ratingUpdated: dict.library.ratingUpdated,
                  progressUpdated: dict.library.progressUpdated,
                }}
              />
            </div>
          ) : (
            <MembersOnlyPanel
              kicker={dict.media.detail.addToLibraryKicker}
              headline={dict.media.detail.addToLibraryHeadline}
              body={dict.media.detail.addToLibraryBody}
              primary={
                <form
                  action={async () => {
                    "use server";
                    await addToLibrary(mediaId, "want_to_watch");
                  }}
                >
                  <button type="submit" className="vhs-btn vhs-aberrate">
                    {dict.media.detail.addToLibraryCta}
                  </button>
                </form>
              }
            />
          )
        ) : (
          <MembersOnlyPanel
            kicker={dict.media.detail.signInKicker}
            headline={dict.media.detail.signInHeadline}
            body={dict.media.detail.signInBody}
            primary={
              <Link
                href={`/${lang}/login`}
                className="vhs-btn vhs-aberrate"
              >
                {dict.media.detail.signInPrimary}
              </Link>
            }
            secondary={
              <Link
                href={`/${lang}/signup`}
                className="vhs-btn vhs-btn--secondary"
              >
                {dict.media.detail.signInSecondary}
              </Link>
            }
            tertiaryNote={dict.media.detail.signInTertiary}
          />
        )}
      </section>
    </main>
  );
}
