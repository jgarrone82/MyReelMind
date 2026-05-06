import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import type { Dictionary } from "@/i18n/types";

interface ForgotPasswordPageProps {
  params: Promise<{ lang: string }>;
  dictionary: Dictionary;
}

export default async function ForgotPasswordPage({
  params,
  dictionary,
}: ForgotPasswordPageProps) {
  const { lang } = await params;
  const t = dictionary.auth.passwordReset;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold">{t.title}</h1>
      <p className="mb-6 text-center text-sm text-gray-600">{t.description}</p>
      <ForgotPasswordForm lang={lang} dict={dictionary} />
    </main>
  );
}
