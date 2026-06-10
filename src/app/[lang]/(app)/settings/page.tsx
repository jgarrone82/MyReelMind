import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthenticatedUser } from "@/lib/auth/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { getDictionary, type Locale } from "@/i18n";
import { SettingsForm } from "@/components/settings/SettingsForm";

interface SettingsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: SettingsPageProps): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: `${dict.settings.title} — MyReelMind`,
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { lang } = await params;

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang as Locale);

  // Fetch user profile
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  if (!userRow) {
    redirect(`/${lang}/login`);
  }

  return (
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-8 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          {/* Membership desk sticker */}
          <span className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
            {dict.settings.kicker}
          </span>
          <h1 className="vhs-display m-0 mt-3 text-[clamp(1.7rem,5vw,2.3rem)] text-[var(--vhs-cream)]">
            {dict.settings.title}
          </h1>
          <div className="vhs-mono mt-1.5 text-[0.72rem] tracking-[0.14em] text-[var(--vhs-phosphor)]">
            <span aria-hidden>▸</span> {dict.settings.subtitle}
          </div>
        </div>

        <SettingsForm
          userId={user.id}
          dict={dict}
          initialValues={{
            displayName: userRow.displayName ?? "",
            avatarUrl: userRow.avatarUrl,
            isPublic: userRow.isPublic,
          }}
        />
      </div>
    </main>
  );
}