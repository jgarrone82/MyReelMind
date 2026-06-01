import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getDictionary, type Locale } from "@/i18n";
import {
  getTotalWatched,
  getTotalHours,
  getRecentActivity,
  getDashboardCounts,
  getInProgressItems,
  getRecentlyWatched,
  getAddedThisWeek,
} from "@/lib/dashboard/stats";
import type { UserMediaWithMedia, DashboardCounts } from "@/lib/dashboard/types";
import { mediaToCardProps, deriveCatalog } from "@/lib/media/vhs-cosmetics";
import { formatPublicId } from "@/lib/media/formatPublicId";
import { MembersOnlyPanel, VHSBoxCard, ShelfRow } from "@/components/vhs";
import {
  MemberCardReceipt,
  type MemberCardStat,
} from "@/components/dashboard/MemberCardReceipt";
import {
  ActivityReceipt,
  type ActivityReceiptItem,
  type ActivityStatusColor,
} from "@/components/dashboard/ActivityReceipt";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface DashboardPageProps {
  params: Promise<{ lang: string }>;
}

type WatchStatus =
  | "want_to_watch"
  | "watching"
  | "completed"
  | "paused"
  | "dropped";

/** Status → receipt-chip color. Cosmetic mapping, deterministic per status. */
const STATUS_COLOR: Record<WatchStatus, ActivityStatusColor> = {
  want_to_watch: "cream",
  watching: "acid",
  completed: "phosphor",
  paused: "sodium",
  dropped: "magenta",
};

export async function generateMetadata({
  params,
}: DashboardPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return {
    title: `${dict.dashboard.title} — MyReelMind`,
  };
}

/** Format a date for the "member since" line, locale-aware (month + year). */
function formatMemberSince(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es" : "en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Format an activity timestamp, locale-aware (short date + time). */
function formatActivityTime(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es" : "en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Build the detail href for a row using the composite public id. */
function detailHref(item: UserMediaWithMedia, lang: string): string | undefined {
  if (!item.mediaItem) return undefined;
  return `/${lang}/media/${formatPublicId(item.mediaItem.source, item.mediaItem.sourceId)}`;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Middleware gates access — we still need userId for stats.
  const session = await getSession();
  const userId = session?.user.id;

  const empty: DashboardCounts = { inProgress: 0, toWatch: 0, totalLogged: 0 };

  const [
    totalWatched,
    totalHours,
    recentActivity,
    counts,
    inProgressItems,
    recentlyWatched,
    addedThisWeek,
    userRow,
  ] = userId
    ? await Promise.all([
        getTotalWatched(userId),
        getTotalHours(userId),
        getRecentActivity(userId, 5),
        getDashboardCounts(userId),
        getInProgressItems(userId),
        getRecentlyWatched(userId),
        getAddedThisWeek(userId),
        db.query.users.findFirst({ where: eq(users.id, userId) }),
      ])
    : [
        0,
        0,
        [] as UserMediaWithMedia[],
        empty,
        [] as UserMediaWithMedia[],
        [] as UserMediaWithMedia[],
        [] as UserMediaWithMedia[],
        undefined,
      ];

  const isEmpty = counts.totalLogged === 0;

  // Member identity. Name/email come from the session; createdAt + displayName
  // come from the users row (the session does not carry them).
  const memberName =
    userRow?.displayName ?? session?.user.email ?? "Member";
  const memberSince = userRow?.createdAt
    ? formatMemberSince(new Date(userRow.createdAt), lang)
    : "—";
  // Card no. is cosmetic — derived deterministically from the user id (#853).
  const cardNo = userId ? deriveCatalog(userId).padded : "00000";

  const titleBlock = (
    <header className="mx-auto mb-2 w-full max-w-[1200px]">
      <div className="vhs-kicker mb-1 text-[0.8rem] text-[var(--vhs-sodium)]">
        {dict.dashboard.kicker}
      </div>
      <h1 className="vhs-display vhs-aberrate m-0 text-[clamp(2.2rem,5vw,3.4rem)] text-[var(--vhs-cream)]">
        {dict.dashboard.title}
      </h1>
      <p className="vhs-mono mt-1 text-[0.92rem] text-[var(--vhs-cream-dim)]">
        {dict.dashboard.greeting}
      </p>
    </header>
  );

  if (isEmpty) {
    return (
      <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-10 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
          {titleBlock}
          <MembersOnlyPanel
            kicker={dict.dashboard.empty.kicker}
            headline={dict.dashboard.empty.headline}
            body={dict.dashboard.empty.body}
            tertiaryNote={dict.dashboard.empty.note}
            stamp={{ line1: "STORE", line2: "CLOSED" }}
            primary={
              <Link href={`/${lang}/search`} className="vhs-btn vhs-aberrate">
                {dict.dashboard.empty.cta}
              </Link>
            }
            secondary={
              <Link
                href={`/${lang}/library`}
                className="vhs-btn vhs-btn--secondary"
              >
                {dict.dashboard.empty.ctaSecondary}
              </Link>
            }
          />
        </div>
      </main>
    );
  }

  const memberStats: MemberCardStat[] = [
    {
      label: dict.dashboard.totalWatched,
      value: String(totalWatched),
      href: `/${lang}/library?status=completed`,
      accent: "phosphor",
    },
    {
      label: dict.dashboard.totalHours,
      value: totalHours.toFixed(1),
      href: `/${lang}/library?status=completed`,
      accent: "acid",
    },
    {
      label: dict.dashboard.inProgress,
      value: String(counts.inProgress),
      href: `/${lang}/library?status=watching`,
      accent: "magenta",
    },
    {
      label: dict.dashboard.toWatch,
      value: String(counts.toWatch),
      href: `/${lang}/library?status=want_to_watch`,
      accent: "sodium",
    },
  ];

  const activityItems: ActivityReceiptItem[] = recentActivity.map((row) => ({
    title: row.mediaItem?.title ?? "Unknown",
    statusLabel: dict.media.status[row.status as WatchStatus],
    statusColor: STATUS_COLOR[row.status as WatchStatus] ?? "cream",
    timestamp: formatActivityTime(new Date(row.updatedAt), lang),
    href: detailHref(row, lang),
  }));

  return (
    <Suspense fallback={<DashboardSkeleton dict={dict.dashboard} />}>
      <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-10 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
        {titleBlock}

        <div className="mt-8">
          <MemberCardReceipt
            title={dict.dashboard.memberCard.title}
            memberLabel={dict.dashboard.memberCard.member}
            memberName={memberName}
            memberSinceLabel={dict.dashboard.memberCard.memberSince}
            memberSince={memberSince}
            cardNoLabel={dict.dashboard.memberCard.cardNo}
            cardNo={cardNo}
            tallyLabel={dict.dashboard.receipt.tally}
            stats={memberStats}
            subtotalLabel={dict.dashboard.receipt.subtotal}
            subtotalValue={String(counts.totalLogged)}
            thankYou={dict.dashboard.receipt.thankYou}
            drillHint={dict.dashboard.receipt.drillHint}
          />
        </div>

        {inProgressItems.length > 0 ? (
          <ShelfRow
            kicker={dict.dashboard.resumeRow}
            count={inProgressItems.length}
            accent="phosphor"
            seeAllLabel={dict.dashboard.seeAll}
            seeAllHref={`/${lang}/library?status=watching`}
          >
            {inProgressItems.map((item) => (
              <VHSBoxCard key={item.id} {...mediaToCardProps(item, lang)} />
            ))}
          </ShelfRow>
        ) : null}

        {recentlyWatched.length > 0 ? (
          <ShelfRow
            kicker={dict.dashboard.recentlyWatched}
            count={recentlyWatched.length}
            accent="acid"
            seeAllLabel={dict.dashboard.seeAll}
            seeAllHref={`/${lang}/library?status=completed`}
          >
            {recentlyWatched.map((item) => (
              <VHSBoxCard key={item.id} {...mediaToCardProps(item, lang)} />
            ))}
          </ShelfRow>
        ) : null}

        {addedThisWeek.length > 0 ? (
          <ShelfRow
            kicker={dict.dashboard.addedThisWeek}
            count={addedThisWeek.length}
            accent="sodium"
            seeAllLabel={dict.dashboard.seeAll}
            seeAllHref={`/${lang}/library`}
          >
            {addedThisWeek.map((item) => (
              <VHSBoxCard
                key={item.id}
                {...mediaToCardProps(item, lang)}
                badge={{ label: dict.media.stickers.new, color: "acid" }}
              />
            ))}
          </ShelfRow>
        ) : null}

        {activityItems.length > 0 ? (
          <ActivityReceipt
            heading={dict.dashboard.activityLog}
            items={activityItems}
          />
        ) : null}
      </main>
    </Suspense>
  );
}
