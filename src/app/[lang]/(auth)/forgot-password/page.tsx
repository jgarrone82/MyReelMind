import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { CRTFrame } from "@/components/vhs";
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
    <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
      <div className="w-full max-w-[440px]">
        {/* Recovery desk sticker */}
        <div className="mb-4 text-center">
          <span
            aria-hidden
            className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]"
          >
            {t.kicker}
          </span>
        </div>

        <CRTFrame glow="phosphor">
          <div className="mb-5 text-center">
            <h1
              className="vhs-display vhs-aberrate m-0 text-[clamp(1.7rem,5vw,2.3rem)] text-[var(--vhs-cream)]"
              style={{
                textShadow:
                  "-1.5px 0 0 var(--vhs-magenta), 1.5px 0 0 var(--vhs-phosphor), 2px 2px 0 var(--vhs-ground)",
              }}
            >
              {t.headline}
            </h1>
            <p className="vhs-mono mt-1.5 text-[0.72rem] tracking-[0.14em] text-[var(--vhs-phosphor)]">
              ▸ {t.subtitle}
            </p>
          </div>

          <ForgotPasswordForm lang={lang} dict={dictionary} />
        </CRTFrame>

        <p className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.finePrint}
        </p>
      </div>
    </main>
  );
}
