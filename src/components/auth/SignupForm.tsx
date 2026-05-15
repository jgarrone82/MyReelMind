"use client";

import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface SignupFormProps {
  lang: string;
  dict: Dictionary;
}

export function SignupForm({ lang, dict }: SignupFormProps) {
  const [error, action] = useActionState(signUp, null);
  const t = dict.auth.signup;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-primary px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-primary">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-primary px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary">
          {t.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-primary px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <SubmitButton t={t} />

      {error && typeof error === 'object' && 'error' in error && (
        <p role="alert" className="text-sm text-error">
          {String(error.error)}
        </p>
      )}

      <p className="text-sm text-secondary">
        {dict.auth.login.title}{" "}
        <Link href={`/${lang}/login`} className="text-accent hover:text-accent/80">
          {dict.auth.login.submit}
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({ t }: { t: Pick<Dictionary["auth"]["signup"], "submit" | "loading"> }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:bg-muted"
    >
      {pending ? t.loading : t.submit}
    </button>
  );
}