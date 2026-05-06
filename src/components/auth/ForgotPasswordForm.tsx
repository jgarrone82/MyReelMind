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

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-50 p-4">
          <h2 className="text-lg font-medium text-green-800">{t.success}</h2>
          <p className="mt-1 text-sm text-green-700">{t.successDescription}</p>
        </div>
        <p className="text-sm text-gray-600">
          <Link href={`/${lang}/login`} className="text-blue-600 hover:text-blue-800">
            {t.backToLogin}
          </Link>
        </p>
      </div>
    );
  }

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

      <SubmitButton t={t} />

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <p className="text-sm text-gray-600">
        <Link href={`/${lang}/login`} className="text-blue-600 hover:text-blue-800">
          {t.backToLogin}
        </Link>
      </p>
    </form>
  );
}

function SubmitButton({ t }: { t: Pick<Dictionary["auth"]["passwordReset"], "submit" | "loading"> }) {
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
