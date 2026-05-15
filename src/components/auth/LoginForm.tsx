"use client";

import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface LoginFormProps {
  lang: string;
  dict: Dictionary;
}

export function LoginForm({ lang, dict }: LoginFormProps) {
  const [error, action] = useActionState(signIn, null);
  const t = dict.auth.login;

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
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-primary px-3 py-2 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="mt-1 text-right">
          <Link href={`/${lang}/forgot-password`} className="text-xs text-accent hover:text-accent/80">
            {t.forgotPassword}
          </Link>
        </div>
      </div>

      <SubmitButton t={t} />

      {error && typeof error === 'object' && 'error' in error && (
        <p role="alert" className="text-sm text-error">
          {String(error.error)}
        </p>
      )}

      <p className="text-sm text-secondary">
        {dict.auth.signup.title}{" "}
        <Link href={`/${lang}/signup`} className="text-accent hover:text-accent/80">
          {dict.auth.signup.submit}
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({ t }: { t: Pick<Dictionary["auth"]["login"], "submit" | "loading"> }) {
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