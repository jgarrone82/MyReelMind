import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { CRTFrame } from "@/components/vhs";
import { getDictionary, type Locale } from "@/i18n";

interface LoginPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ password_updated?: string; verified?: string }>;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const { password_updated, verified } = await searchParams;
  const t = dictionary.auth.login;

  return (
    <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
      <div className="w-full max-w-[440px]">
        {/* Membership desk sticker */}
        <div className="mb-4 text-center">
          <span className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
            {t.kicker}
          </span>
        </div>

        {/* CRT display frame — the memorable moment */}
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
            <div className="vhs-mono mt-1.5 text-[0.72rem] tracking-[0.14em] text-[var(--vhs-phosphor)]">
              ▸ {t.subtitle}
            </div>
          </div>

          {password_updated && (
            <div className="mb-4 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-acid)] px-3 py-2.5 shadow-[3px_3px_0_var(--vhs-ground)]">
              <p className="vhs-mono text-[0.8rem] text-[var(--vhs-ground)]">
                {dictionary.auth.passwordReset.passwordUpdated}
              </p>
            </div>
          )}
          {verified && (
            <div className="mb-4 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-acid)] px-3 py-2.5 shadow-[3px_3px_0_var(--vhs-ground)]">
              <p className="vhs-mono text-[0.8rem] text-[var(--vhs-ground)]">
                {dictionary.auth.emailVerification.emailConfirmed}
              </p>
            </div>
          )}

          <LoginForm lang={lang} dict={dictionary} />

          {/* Divider — keeps the literal "or" value while reading as a labelled rule */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-0.5 flex-1 bg-[var(--vhs-ground-3)]" />
            <span className="vhs-kicker whitespace-nowrap text-[0.72rem] text-[var(--vhs-cream-dim)]">
              {t.divider}
            </span>
            <span className="h-0.5 flex-1 bg-[var(--vhs-ground-3)]" />
          </div>

          <OAuthButtons dict={dictionary} />

          <div className="vhs-mono mt-4 text-center text-[0.6rem] tracking-[0.12em] text-[var(--vhs-cream-dim)]/55">
            {t.terminalFooter}
          </div>
        </CRTFrame>

        {/* Framed "new here" signup link */}
        <Link
          href={`/${lang}/signup`}
          className="vhs-kicker mt-[18px] block border-2 border-dashed border-[var(--vhs-acid)] bg-[rgba(214,255,62,0.04)] px-4 py-3.5 text-center text-[0.95rem] tracking-[0.14em] text-[var(--vhs-acid)] no-underline transition-shadow duration-150 hover:bg-[rgba(214,255,62,0.1)] hover:shadow-[0_0_18px_rgba(214,255,62,0.25)]"
        >
          {t.newHere} →
        </Link>

        <div className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]/50">
          {t.finePrint}
        </div>
      </div>
    </main>
  );
}
