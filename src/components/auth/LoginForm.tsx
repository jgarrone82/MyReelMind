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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton t={t} />

      {error && typeof error === 'object' && 'error' in error && (
        <p role="alert" className="text-sm text-red-600">
          {String(error.error)}
        </p>
      )}

      <p className="text-sm text-gray-600">
        {dict.auth.signup.title}{" "}
        <Link href={`/${lang}/signup`} className="text-blue-600 hover:text-blue-800">
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
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? t.loading : t.submit}
    </button>
  );
}