import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/server";
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

  const session = await getSession();
  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang as Locale);

  // Fetch user profile
  const userRow = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userRow) {
    redirect(`/${lang}/login`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{dict.settings.title}</h1>

      <SettingsForm
        userId={session.user.id}
        dict={dict}
        initialValues={{
          displayName: userRow.displayName ?? "",
          avatarUrl: userRow.avatarUrl,
          isPublic: userRow.isPublic,
        }}
      />
    </main>
  );
}