import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getDictionary, type Locale } from "@/i18n";

interface ForgotPasswordPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const t = dictionary.auth.passwordReset;

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold">{t.title}</h1>
      <p className="mb-6 text-center text-sm text-gray-600">{t.description}</p>
      <ForgotPasswordForm lang={lang} dict={dictionary} />
    </main>
  );
}
