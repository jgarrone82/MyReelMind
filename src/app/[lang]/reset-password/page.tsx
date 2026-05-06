import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface ResetPasswordPageProps {
  params: Promise<{ lang: string }>;
  dictionary: Dictionary;
}

export default async function ResetPasswordPage({
  params,
  dictionary,
}: ResetPasswordPageProps) {
  const { lang } = await params;
  const t = dictionary.auth.passwordReset;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No active session means the recovery token was not verified
  if (!session) {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="mb-2 text-center text-2xl font-bold">{t.title}</h1>
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">{t.noSession}</p>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            href={`/${lang}/forgot-password`}
            className="text-blue-600 hover:text-blue-800"
          >
            {t.requestNewReset}
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold">{t.title}</h1>
      <ResetPasswordForm dict={dictionary} />
    </main>
  );
}
