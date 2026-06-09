import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { CRTFrame } from "@/components/vhs";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, type Locale } from "@/i18n";
import Link from "next/link";

interface ResetPasswordPageProps {
  params: Promise<{ lang: string }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const t = dictionary.auth.passwordReset;
  const supabase = await createClient();
  // #52 deferral: password-RECOVERY flow gate, not a data-scoping decision. The
  // recovery session itself is the proof the email token was verified, and the
  // password update is enforced server-side on submit. getSession stays here on
  // purpose — migrating to getUser() risks the special recovery session.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // No active session means the recovery token was not verified
  if (!session) {
    return (
      <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
        <div className="w-full max-w-[440px]">
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

            <div className="flex flex-col gap-4">
              <div
                role="alert"
                className="flex items-start gap-2.5 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-error)] px-3 py-2.5 text-[var(--vhs-ground)] shadow-[3px_3px_0_var(--vhs-ground)]"
              >
                <span aria-hidden className="vhs-display text-[1.2rem] leading-none">
                  ⚠
                </span>
                <div>
                  <div className="vhs-kicker text-[0.78rem] tracking-[0.16em]">
                    {t.errorHeadline}
                  </div>
                  <p className="vhs-mono mt-0.5 text-[0.78rem] leading-snug">
                    {t.noSession}
                  </p>
                </div>
              </div>

              <p className="vhs-mono text-center text-[0.8rem] text-[var(--vhs-cream-dim)]">
                <Link
                  href={`/${lang}/forgot-password`}
                  className="text-[var(--vhs-acid)] underline decoration-[var(--vhs-acid)] underline-offset-2 hover:text-[var(--vhs-cream)]"
                >
                  {t.requestNewReset}
                </Link>
              </p>
            </div>
          </CRTFrame>

          <p className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]">
            {t.finePrint}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
      <div className="w-full max-w-[440px]">
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

          <ResetPasswordForm dict={dictionary} />
        </CRTFrame>

        <p className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.finePrint}
        </p>
      </div>
    </main>
  );
}
