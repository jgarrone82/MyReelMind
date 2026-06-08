import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getAuthenticatedUser } from "@/lib/auth/server";
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
  // Server-revalidated identity (#52): this page gates access and derives the
  // email shown in the resend form, so it must not trust the unverified
  // getSession cookie read.
  const user = await getAuthenticatedUser();

  // Protected route: redirect to login if not authenticated
  if (!user) {
    redirect(`/${lang}/login`);
  }

  // If email is already confirmed, redirect to dashboard
  if (user.email_confirmed_at) {
    redirect(`/${lang}/dashboard`);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <VerifyEmailForm
        email={user.email ?? ""}
        dict={dictionary}
        lang={lang}
      />
    </main>
  );
}
