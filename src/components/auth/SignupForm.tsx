"use client";

import { useActionState, useState } from "react";
import { signUp } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface SignupFormProps {
  lang: string;
  dict: Dictionary;
}

type SignUpState = Awaited<ReturnType<typeof signUp>> | null;
type SignupCopy = Dictionary["auth"]["signup"];

function getErrorMessage(state: SignUpState): string | null {
  if (state && typeof state === "object" && "error" in state) {
    return String(state.error ?? "");
  }
  return null;
}

/**
 * Mechanical pass-code strength score (0..4), mirroring the design prototype:
 * one point each for length >= 8, mixed case, a digit, and a symbol. An empty
 * field is 0; any non-empty field scores at least 1.
 */
function passCodeStrength(value: string): 0 | 1 | 2 | 3 | 4 {
  if (value.length === 0) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.max(1, score) as 1 | 2 | 3 | 4;
}

export function SignupForm({ lang, dict }: SignupFormProps) {
  const [state, action] = useActionState<SignUpState, FormData>(signUp, null);
  const t = dict.auth.signup;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const rawError = getErrorMessage(state);
  // An error key is present whenever the action returns an { error } object,
  // even if the message string is empty (we then fall back to the generic body).
  const hasError = rawError !== null;
  const errorBody = rawError && rawError.length > 0 ? rawError : t.errorBody;

  const strength = passCodeStrength(password);
  const strengthLabel = [
    t.strength0,
    t.strength1,
    t.strength2,
    t.strength3,
    t.strength4,
  ][strength];

  // Confirm-match indicator — derived, decorative-glyph + textual status.
  const confirmShown = confirm.length > 0;
  const matches = confirmShown && confirm === password;

  // Cassette-field input chrome, identical to LoginForm: phosphor focus
  // ring/glow by default, tape-red border while an error is present.
  const inputBase =
    "vhs-mono mt-1 block w-full rounded-[2px] border-2 bg-[var(--vhs-ground-2)] px-3 py-2.5 text-[var(--vhs-cream)] placeholder:text-[var(--vhs-cream-dim)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--vhs-phosphor)] focus:ring-offset-0 focus:shadow-[0_0_0_1px_var(--vhs-phosphor),0_0_14px_rgba(74,255,240,0.35)]";
  const inputBorder = hasError
    ? "border-[var(--vhs-error)] focus:border-[var(--vhs-error)]"
    : "border-[var(--vhs-ground-3)] focus:border-[var(--vhs-phosphor)]";

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Form-number stamp — decorative carbon-copy detail from the prototype. */}
      <div className="flex items-center justify-between border-b-2 border-[var(--vhs-ground-3)] pb-2.5">
        <span className="vhs-kicker text-[0.7rem] tracking-[0.14em] text-[var(--vhs-cream-dim)]">
          {t.formNo}
        </span>
        <span
          aria-hidden
          className="vhs-mono inline-block rotate-[2deg] border border-[var(--vhs-cream-dim)]/50 px-1.5 py-0.5 text-[0.6rem] text-[var(--vhs-cream-dim)]"
        >
          No. 0485
        </span>
      </div>

      {hasError && (
        <div
          id="signup-error"
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
              {errorBody}
            </p>
          </div>
        </div>
      )}

      {/* Email */}
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
          aria-describedby={hasError ? "signup-error" : undefined}
          className={`${inputBase} ${inputBorder}`}
        />
      </div>

      {/* Pass code + dot-matrix strength meter */}
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
            aria-label={`${showPassword ? t.hidePassword : t.showPassword} ${t.passwordLabel}`}
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
          minLength={8}
          autoComplete="new-password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "signup-error" : undefined}
          className={`${inputBase} ${inputBorder}`}
        />
        <div className="mt-1.5 flex flex-col gap-1">
          {/* Caption for the strength meter, styled like the VHS field labels. */}
          <span
            id="signup-strength-caption"
            className="vhs-kicker text-[0.6rem] uppercase tracking-[0.1em] text-[var(--vhs-cream-dim)]/60"
          >
            {t.strengthLabel}
          </span>
          <div className="flex items-center gap-3">
            {/* Decorative dot-matrix meter — pure Tailwind dots, hidden from AT. */}
            <div aria-hidden className="flex items-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full border border-[var(--vhs-ground-3)] ${
                    i < strength
                      ? "bg-[var(--vhs-phosphor)]"
                      : "bg-[var(--vhs-ground-2)]"
                  }`}
                />
              ))}
            </div>
            {/* The textual label carries the accessible meaning. */}
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-labelledby="signup-strength-caption"
              className="vhs-mono text-[0.72rem] text-[var(--vhs-cream-dim)]"
            >
              {strengthLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm pass code + match indicator */}
      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="confirmPassword"
            className="vhs-kicker text-[0.8rem] text-[var(--vhs-cream)]"
          >
            {t.confirmLabel}
          </label>
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-pressed={showConfirm}
            aria-controls="confirmPassword"
            aria-label={`${showConfirm ? t.hidePassword : t.showPassword} ${t.confirmLabel}`}
            className="vhs-kicker rounded-[2px] p-0 text-[0.7rem] tracking-[0.14em] text-[var(--vhs-phosphor)] hover:text-[var(--vhs-cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)]"
          >
            {showConfirm ? t.hidePassword : t.showPassword}
          </button>
        </div>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirm ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder={t.confirmPlaceholder}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "signup-error" : undefined}
          className={`${inputBase} ${inputBorder}`}
        />
        <div role="status" aria-live="polite" aria-atomic="true">
          {confirmShown && (
            <div
              className={`mt-1.5 flex items-center gap-1.5 ${
                matches
                  ? "text-[var(--vhs-phosphor)]"
                  : "text-[var(--vhs-magenta)]"
              }`}
            >
              <span
                aria-hidden
                className="vhs-mono grid h-4 w-4 place-items-center border text-[0.7rem] leading-none"
              >
                {matches ? "✓" : "✕"}
              </span>
              {/* Text — not color — communicates the match state to AT. */}
              <span className="vhs-mono text-[0.72rem]">
                {matches ? t.matchOk : t.matchNo}
              </span>
            </div>
          )}
        </div>
      </div>

      <SubmitButton t={t} />

      {/* Footer — "already a member?" link to the login page. */}
      <p className="vhs-mono mt-1 text-center text-[0.8rem] text-[var(--vhs-cream-dim)]">
        {t.already}{" "}
        <Link
          href={`/${lang}/login`}
          className="text-[var(--vhs-acid)] underline decoration-[var(--vhs-acid)] underline-offset-2 hover:text-[var(--vhs-cream)]"
        >
          {t.signin}
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({
  t,
}: {
  t: Pick<SignupCopy, "submit" | "loadingTape">;
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
