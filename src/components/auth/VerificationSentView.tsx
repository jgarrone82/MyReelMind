"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { sendVerificationEmail } from "@/actions/auth";
import type { Dictionary } from "@/i18n/types";

interface VerificationSentViewProps {
  email: string;
  dict: Dictionary;
  lang: string;
}

export function VerificationSentView({ email, dict, lang }: VerificationSentViewProps) {
  const t = dict.auth.emailVerification;
  const [state, action] = useActionState(sendVerificationEmail, null);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h1
          className="vhs-display vhs-aberrate m-0 text-[clamp(1.7rem,5vw,2.3rem)] text-[var(--vhs-cream)]"
          style={{
            textShadow:
              "-1.5px 0 0 var(--vhs-magenta), 1.5px 0 0 var(--vhs-phosphor), 2px 2px 0 var(--vhs-ground)",
          }}
        >
          {t.title}
        </h1>
        <div className="vhs-mono mt-1.5 text-[0.72rem] text-[var(--vhs-phosphor)]">
          <span aria-hidden>▸</span> {t.sentSubtitle}
        </div>
        <p className="vhs-mono mt-1.5 text-[0.8rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.description}
        </p>
      </div>

      <div className="border-2 border-[var(--vhs-ground)] bg-[var(--vhs-acid)] px-3 py-2.5 shadow-[3px_3px_0_var(--vhs-ground)]">
        <p className="vhs-mono text-[0.8rem] text-[var(--vhs-ground)]">
          {t.checkInbox} <strong>{email}</strong>
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <ResendButton t={t} />
      </form>

      {state?.success && (
        <div
          role="status"
          className="border-2 border-[var(--vhs-ground)] bg-[var(--vhs-acid)] px-3 py-2.5 shadow-[3px_3px_0_var(--vhs-ground)]"
        >
          <p className="vhs-mono text-[0.8rem] text-[var(--vhs-ground)]">
            {t.resendSuccess}
          </p>
        </div>
      )}

      {state?.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-error)] px-3 py-2.5 text-[var(--vhs-ground)] shadow-[3px_3px_0_var(--vhs-ground)]"
        >
          <span aria-hidden className="vhs-display text-[1.2rem] leading-none">
            ⚠
          </span>
          <div>
            <div className="vhs-kicker text-[0.78rem]">
              {t.errorHeadline}
            </div>
            <p className="vhs-mono mt-0.5 text-[0.78rem] leading-snug">
              {t.resendError}
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link
          href={`/${lang}/login`}
          className="vhs-mono text-[0.8rem] text-[var(--vhs-acid)] underline decoration-[var(--vhs-acid)] underline-offset-2 hover:text-[var(--vhs-cream)]"
        >
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}

function ResendButton({
  t,
}: {
  t: Pick<Dictionary["auth"]["emailVerification"], "resendButton" | "loadingTape">;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="vhs-btn vhs-focus vhs-aberrate w-full justify-center disabled:opacity-85"
    >
      {pending && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--vhs-cream)] border-t-transparent"
        />
      )}
      <span>{pending ? t.loadingTape : t.resendButton}</span>
    </button>
  );
}
