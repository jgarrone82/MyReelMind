import { VerificationSentView } from "@/components/auth/VerificationSentView";
import { CRTFrame } from "@/components/vhs";
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
      <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
        <div className="w-full max-w-[440px]">
          <p className="vhs-mono text-center text-[0.9rem] text-[var(--vhs-cream-dim)]">
            {dictionary.auth.passwordReset.noEmailProvided}
          </p>
        </div>
      </main>
    );
  }

  const t = dictionary.auth.emailVerification;

  return (
    <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
      <div className="w-full max-w-[440px]">
        <div className="mb-4 text-center">
          <span
            aria-hidden
            className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]"
          >
            {t.sentKicker}
          </span>
        </div>

        <CRTFrame glow="phosphor">
          <VerificationSentView email={email} dict={dictionary} lang={lang} />
        </CRTFrame>

        <p className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.finePrint}
        </p>
      </div>
    </main>
  );
}
