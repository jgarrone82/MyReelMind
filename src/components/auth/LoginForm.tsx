"use client";

import { useActionState, useId, useState } from "react";
import { signIn } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface LoginFormProps {
  lang: string;
  dict: Dictionary;
}

type SignInState = Awaited<ReturnType<typeof signIn>> | null;

function getErrorMessage(state: SignInState): string | null {
  if (state && typeof state === "object" && "error" in state) {
    return String(state.error ?? "");
  }
  return null;
}

export function LoginForm({ lang, dict }: LoginFormProps) {
  const [state, action] = useActionState<SignInState, FormData>(signIn, null);
  const t = dict.auth.login;

  const [showPassword, setShowPassword] = useState(false);

  const rawError = getErrorMessage(state);
  // An error key is present whenever the action returns an { error } object,
  // even if the message string is empty (we then fall back to the generic body).
  const hasError = rawError !== null;
  const errorBody = rawError && rawError.length > 0 ? rawError : t.errorBody;

  // Cassette-field input chrome. Phosphor focus ring/glow by default, tape-red
  // border while an error is present.
  const inputBase =
    "vhs-mono mt-1 block w-full rounded-[2px] border-2 bg-[var(--vhs-ground-2)] px-3 py-2.5 text-[var(--vhs-cream)] placeholder:text-[var(--vhs-cream-dim)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vhs-phosphor)] focus:ring-offset-0 focus:shadow-[0_0_0_1px_var(--vhs-phosphor),0_0_14px_rgba(74,255,240,0.35)]";
  const inputBorder = hasError
    ? "border-[var(--vhs-error)] focus:border-[var(--vhs-error)]"
    : "border-[var(--vhs-ground-3)] focus:border-[var(--vhs-phosphor)]";

  return (
    <form action={action} className="flex flex-col gap-4">
      {hasError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-error)] px-3 py-2.5 text-[var(--vhs-cream)] shadow-[3px_3px_0_var(--vhs-ground)]"
        >
          <span aria-hidden className="vhs-display text-[1.2rem] leading-none">
            ⚠
          </span>
          <div>
            <div className="vhs-kicker text-[0.78rem] tracking-[0.16em]">
              {t.errorHeadline}
            </div>
            <p className="vhs-mono mt-0.5 text-[0.78rem] leading-snug">
              {errorBody}
            </p>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="flex items-baseline justify-between text-[var(--vhs-cream)]"
        >
          <span className="vhs-kicker text-[0.8rem]">{t.emailLabel}</span>
          <span
            aria-hidden
            className="vhs-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--vhs-cream-dim)]/60"
          >
            {t.emailRequired}
          </span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          aria-invalid={hasError || undefined}
          className={`${inputBase} ${inputBorder}`}
        />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="password"
            className="vhs-kicker text-[0.8rem] text-[var(--vhs-cream)]"
          >
            {t.passwordLabel}
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            aria-controls="password"
            className="vhs-kicker rounded-[2px] p-0 text-[0.7rem] tracking-[0.14em] text-[var(--vhs-phosphor)] hover:text-[var(--vhs-cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)]"
          >
            {showPassword ? t.hidePassword : t.showPassword}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder={t.passwordPlaceholder}
          aria-invalid={hasError || undefined}
          className={`${inputBase} ${inputBorder}`}
        />
        <div className="mt-1.5 text-right">
          <Link
            href={`/${lang}/forgot-password`}
            className="vhs-mono text-[0.78rem] italic text-[var(--vhs-cream-dim)] underline decoration-[var(--vhs-cream-dim)] underline-offset-2 hover:text-[var(--vhs-cream)]"
          >
            {t.forgotPassword}
          </Link>
        </div>
      </div>

      <SubmitButton t={t} />
    </form>
  );
}

function SubmitButton({
  t,
}: {
  t: Pick<Dictionary["auth"]["login"], "submit" | "loadingTape">;
}) {
  const { pending } = useFormStatus();
  const spinnerLabelId = useId();

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
      <span id={spinnerLabelId}>{pending ? t.loadingTape : t.submit}</span>
    </button>
  );
}
