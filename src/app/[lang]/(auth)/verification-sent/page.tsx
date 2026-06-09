import { VerificationSentView } from "@/components/auth/VerificationSentView";
import { getDictionary, type Locale } from "@/i18n";

interface VerificationSentPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function VerificationSentPage({
  params,
  searchParams,
}: VerificationSentPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const { email } = await searchParams;

  if (!email) {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <p className="text-center text-gray-600">No email provided.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <VerificationSentView email={email} dict={dictionary} lang={lang} />
    </main>
  );
}
