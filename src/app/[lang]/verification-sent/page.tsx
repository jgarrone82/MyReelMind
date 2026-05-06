import { VerificationSentView } from "@/components/auth/VerificationSentView";
import type { Dictionary } from "@/i18n/types";

interface VerificationSentPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ email?: string }>;
  dictionary: Dictionary;
}

export default async function VerificationSentPage({
  params,
  searchParams,
  dictionary,
}: VerificationSentPageProps) {
  const { lang } = await params;
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
