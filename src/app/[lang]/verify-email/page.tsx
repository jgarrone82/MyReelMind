import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import type { Dictionary } from "@/i18n/types";

interface VerifyEmailPageProps {
  params: Promise<{ lang: string }>;
  dictionary: Dictionary;
}

export default async function VerifyEmailPage({
  params,
  dictionary,
}: VerifyEmailPageProps) {
  const { lang } = await params;
  const session = await getSession();

  // Protected route: redirect to login if no session
  if (!session) {
    redirect(`/${lang}/login`);
  }

  // If email is already confirmed, redirect to dashboard
  if (session.user.email_confirmed_at) {
    redirect(`/${lang}/dashboard`);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <VerifyEmailForm
        email={session.user.email ?? ""}
        dict={dictionary}
        lang={lang}
      />
    </main>
  );
}
