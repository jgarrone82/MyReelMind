"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface ForgotPasswordFormProps {
  lang: string;
  dict: Dictionary;
}

export function ForgotPasswordForm({ lang, dict }: ForgotPasswordFormProps) {
  const [state, action] = useActionState(forgotPassword, null);
  const t = dict.auth.passwordReset;

  const hasError = Boolean(state?.error);

  // Cassette-field input chrome, mirroring login/signup: phosphor focus
  // ring/glow by default, tape-red border while an error is present.
  const inputBase =
    "vhs-mono mt-1 block w-full rounded-[2px] border-2 bg-[var(--vhs-ground-2)] px-3 py-2.5 text-[var(--vhs-cream)] placeholder:text-[var(--vhs-cream-dim)]/60 focus-visible:outline-none focus:ring-2 focus:ring-[var(--vhs-phosphor)] focus:ring-offset-0 focus:shadow-[0_0_0_1px_var(--vhs-phosphor),0_0_14px_rgba(74,255,240,0.35)]";
  const inputBorder = hasError
    ? "border-[var(--vhs-error)] focus:border-[var(--vhs-error)]"
    : "border-[var(--vhs-ground-3)] focus:border-[var(--vhs-phosphor)]";

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-2 border-[var(--vhs-ground)] bg-[var(--vhs-acid)] px-3 py-2.5 shadow-[3px_3px_0_var(--vhs-ground)]">
          <p className="vhs-kicker text-[0.78rem] tracking-[0.16em] text-[var(--vhs-ground)]">
            {t.success}
          </p>
          <p className="vhs-mono mt-0.5 text-[0.8rem] text-[var(--vhs-ground)]">
            {t.successDescription}
          </p>
        </div>
        <p className="vhs-mono text-center text-[0.8rem] text-[var(--vhs-cream-dim)]">
          <Link
            href={`/${lang}/login`}
            className="text-[var(--vhs-acid)] underline decoration-[var(--vhs-acid)] underline-offset-2 hover:text-[var(--vhs-cream)]"
          >
            {t.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {hasError && (
        <div
          id="email-error"
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
              {state?.error}
            </p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="vhs-kicker text-[0.8rem] text-[var(--vhs-cream)]">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "email-error" : undefined}
          className={`${inputBase} ${inputBorder}`}
        />
      </div>

      <SubmitButton t={t} />

      <p className="vhs-mono text-center text-[0.8rem] text-[var(--vhs-cream-dim)]">
        <Link
          href={`/${lang}/login`}
          className="text-[var(--vhs-acid)] underline decoration-[var(--vhs-acid)] underline-offset-2 hover:text-[var(--vhs-cream)]"
        >
          {t.backToLogin}
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({
  t,
}: {
  t: Pick<Dictionary["auth"]["passwordReset"], "submit" | "loadingTape">;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="vhs-btn vhs-aberrate mt-1 w-full justify-center disabled:opacity-85"
    >
      {pending && (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--vhs-cream)] border-t-transparent"
        />
      )}
      <span>{pending ? t.loadingTape : t.submit}</span>
    </button>
  );
}
