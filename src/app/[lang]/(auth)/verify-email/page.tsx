import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { CRTFrame } from "@/components/vhs";
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

  // If email is already confirmed, redirect to the home dashboard at /{lang}
  if (user.email_confirmed_at) {
    redirect(`/${lang}`);
  }

  const t = dictionary.auth.emailVerification;

  return (
    <main className="vhs-scanlines vhs-crt relative flex min-h-screen flex-col items-center justify-center bg-[var(--vhs-ground)] px-4 py-12 text-[var(--vhs-cream)]">
      <div className="w-full max-w-[440px]">
        <div className="mb-4 text-center">
          <span className="vhs-kicker inline-block rotate-[-1deg] border-2 border-[var(--vhs-ground)] bg-[var(--vhs-sodium)] px-3 py-1 text-[0.72rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]">
            {t.verifyKicker}
          </span>
        </div>

        <CRTFrame glow="phosphor">
          <VerifyEmailForm
            email={user.email ?? ""}
            dict={dictionary}
            lang={lang}
          />
        </CRTFrame>

        <p className="vhs-mono mt-3.5 text-center text-[0.62rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.finePrint}
        </p>
      </div>
    </main>
  );
}
