import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { db } from "@/db";
import { users, userMedia } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getDictionary, type Locale } from "@/i18n";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import Link from "next/link";

interface PublicProfilePageProps {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: `${dict.profile.title} — MyReelMind`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as Locale);

  // Fetch the user by id
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  // Not found
  if (!userRow) {
    notFound();
  }

  // Private profile
  if (!userRow.isPublic) {
    return (
      <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] p-6 text-center shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
            <h2 className="vhs-display m-0 text-[clamp(1.4rem,4vw,1.9rem)] text-[var(--vhs-cream)]">
              {dict.profile.privateTitle}
            </h2>
            <p className="vhs-mono mt-3 text-[0.82rem] text-[var(--vhs-cream-dim)]">
              {dict.profile.privateMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Check if viewing own profile
  const user = await getAuthenticatedUser();
  const isOwnProfile = user?.id === userRow.id;

  // Fetch user's library items (recent 10)
  const libraryItems = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userRow.id),
    with: {
      mediaItem: true,
    },
    orderBy: [desc(userMedia.updatedAt)],
    limit: 10,
  });

  // Compute stats
  const allItems = await db.query.userMedia.findMany({
    where: eq(userMedia.userId, userRow.id),
  });

  const stats = {
    total: allItems.length,
    completed: allItems.filter((i) => i.status === "completed").length,
    watching: allItems.filter((i) => i.status === "watching").length,
  };

  const formattedItems = libraryItems.map((item) => ({
    id: item.id,
    mediaItemId: item.mediaItemId,
    status: item.status,
    rating: item.rating,
    progress: item.progress,
    updatedAt: item.updatedAt.toISOString(),
    mediaItem: item.mediaItem
      ? {
          source: item.mediaItem.source,
          sourceId: item.mediaItem.sourceId,
          title: item.mediaItem.title,
          posterPath: item.mediaItem.posterPath,
          type: item.mediaItem.type,
          runtime: item.mediaItem.runtime,
        }
      : null,
  }));

  return (
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          {/* Member-card sticker */}
          <span className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
            {dict.profile.kicker}
          </span>
          <div className="vhs-mono mt-3 text-[0.72rem] tracking-[0.14em] text-[var(--vhs-phosphor)]">
            <span aria-hidden>▸</span> {dict.profile.subtitle}
          </div>
        </div>

        <PublicProfileCard
          user={{
            id: userRow.id,
            displayName: userRow.displayName,
            avatarUrl: userRow.avatarUrl,
          }}
          stats={stats}
          dict={{
            items: dict.profile.items,
            completed: dict.profile.completed,
            watching: dict.profile.watching,
          }}
        />

        {isOwnProfile && (
          <div className="mt-6 text-center">
            <Link
              href={`/${lang}/settings`}
              className="vhs-mono text-[0.78rem] tracking-[0.08em] text-[var(--vhs-phosphor)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
            >
              {dict.profile.editSettings}
            </Link>
          </div>
        )}

        {/* Recent activity */}
        {formattedItems.length > 0 ? (
          <section className="mt-8">
            <h3 className="vhs-kicker mb-4 text-[0.85rem] tracking-[0.14em] text-[var(--vhs-cream)]">
              {dict.profile.recentActivity}
            </h3>
            <ul className="space-y-3">
              {formattedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] p-3 shadow-[3px_3px_0_rgba(0,0,0,0.8)]"
                >
                  {item.mediaItem?.posterPath ? (
                    <Image
                      src={item.mediaItem.posterPath}
                      alt={item.mediaItem.title ?? ""}
                      width={32}
                      height={48}
                      className="h-12 w-8 rounded-[2px] object-cover"
                    />
                  ) : (
                    <div className="h-12 w-8 rounded-[2px] bg-[var(--vhs-ground-3)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="vhs-display truncate text-sm text-[var(--vhs-cream)]">
                      {item.mediaItem?.title ?? "Unknown"}
                    </p>
                    <p className="vhs-mono text-xs text-[var(--vhs-cream-dim)]">
                      {dict.media.status[item.status]}
                      {item.rating ? ` · ${item.rating}/10` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="vhs-mono mt-8 text-center text-[var(--vhs-cream-dim)]">
            {dict.profile.emptyLibrary}
          </p>
        )}
      </div>
    </main>
  );
}