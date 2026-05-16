import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getSession } from "@/lib/auth/server";
import { getDictionary, type Locale } from "@/i18n";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  params: Promise<{ lang: string }>;
}

export default async function VerifyEmailPage({
  params,
}: VerifyEmailPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
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
