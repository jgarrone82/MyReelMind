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
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-md bg-gray-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">{dict.profile.privateTitle}</h2>
          <p className="mt-2 text-gray-600">{dict.profile.privateMessage}</p>
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
    <main className="mx-auto max-w-3xl px-4 py-8">
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
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {dict.profile.editSettings}
          </Link>
        </div>
      )}

      {/* Recent activity */}
      {formattedItems.length > 0 ? (
        <section className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {dict.profile.recentActivity}
          </h3>
          <ul className="space-y-3">
            {formattedItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-md border p-3">
                {item.mediaItem?.posterPath ? (
                  <Image
                    src={item.mediaItem.posterPath}
                    alt={item.mediaItem.title ?? ""}
                    width={32}
                    height={48}
                    className="h-12 w-8 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-8 rounded bg-gray-200" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.mediaItem?.title ?? "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dict.media.status[item.status]}
                    {item.rating ? ` · ${item.rating}/10` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-8 text-center text-gray-500">{dict.profile.emptyLibrary}</p>
      )}
    </main>
  );
}