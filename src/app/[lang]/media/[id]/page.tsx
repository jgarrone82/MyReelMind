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

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { lang, id: mediaId } = await params;
  const media = await fetchMediaDetail(mediaId);

  if (!media) {
    notFound();
  }

  // Fetch user library data if authenticated
  const session = await getSession();
  let userEntry = null;

  if (session) {
    const mediaItemRecord = await db.query.mediaItems.findFirst({
      where: and(
        eq(mediaItems.source, media.source),
        eq(mediaItems.sourceId, media.source === "tmdb"
          ? mediaId.replace("tmdb-", "")
          : mediaId.replace("anilist-", ""))
      ),
    });

    if (mediaItemRecord) {
      userEntry = await db.query.userMedia.findFirst({
        where: and(
          eq(userMedia.userId, session.user.id),
          eq(userMedia.mediaItemId, mediaItemRecord.id)
        ),
      });
    }
  }

  const dict = await getDictionary(lang as Locale);

  const sourceLabel = media.source.toUpperCase();
  const typeLabel = media.type === "movie" ? dict.media.movie : media.type === "tv" ? dict.media.tv : dict.media.anime;

  // Determine media type for component
  const componentType = media.type === "movie" ? "movie" : media.type === "tv" ? "tv" : "anime";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Banner */}
      {media.bannerImage && (
        <div className="relative mb-8 h-64 w-full overflow-hidden rounded-lg bg-gray-200 sm:h-80 lg:h-96">
          <Image
            src={media.bannerImage}
            alt={`${media.title ?? "Unknown"} banner`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {media.title ?? "Unknown"}
            </h1>
            {media.originalTitle && media.originalTitle !== media.title && (
              <p className="mt-1 text-sm text-white/80">{media.originalTitle}</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Cover & Info */}
        <div className="flex-shrink-0 lg:w-80">
          <div className="relative aspect-[2/3] w-full max-w-xs overflow-hidden rounded-lg bg-gray-200 lg:max-w-none">
            {media.coverImage ? (
              <Image
                src={media.coverImage}
                alt={`${media.title ?? "Unknown"} poster`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            ) : (
              <div
                role="img"
                aria-label={`${media.title ?? "Unknown"} poster`}
                className="flex h-full w-full items-center justify-center bg-gray-200"
              >
                <span className="text-4xl text-gray-400">🎬</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                {sourceLabel}
              </span>
              <span className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
                {typeLabel}
              </span>
            </div>
            {media.year && (
              <p className="text-sm text-gray-600">{media.year}</p>
            )}
            {media.score && (
              <p className="text-sm text-gray-600">Score: {media.score / 10}/10</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          {!media.bannerImage && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {media.title ?? "Unknown"}
              </h1>
              {media.originalTitle && media.originalTitle !== media.title && (
                <p className="mt-1 text-gray-600">{media.originalTitle}</p>
              )}
            </>
          )}

          {media.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">{media.description}</p>
          )}

          {media.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {media.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Collection Controls - Client Component */}
          {session ? (
            userEntry ? (
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
            ) : (
              <div className="mt-8 rounded-lg border border-gray-200 p-4">
                <p className="mb-4 text-gray-700">{dict.library.addToLibrary}</p>
                <form action={async () => {
                  "use server";
                  await addToLibrary(mediaId, "want_to_watch");
                }}>
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {dict.library.addToLibrary}
                  </button>
                </form>
              </div>
            )
          ) : (
            <div className="mt-8 rounded-lg border border-gray-200 p-4">
              <p className="mb-4 text-gray-700">{dict.library.addToLibrary}</p>
              <Link
                href={`/${lang}/login`}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {dict.auth.login.title}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}