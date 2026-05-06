"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resendVerificationEmail } from "@/actions/auth";
import type { Dictionary } from "@/i18n/types";

interface VerifyEmailFormProps {
  email: string;
  dict: Dictionary;
  lang: string;
}

export function VerifyEmailForm({ email, dict, lang }: VerifyEmailFormProps) {
  const t = dict.auth.emailVerification;
  const [state, action] = useActionState(resendVerificationEmail, null);

  return (
    <div className="space-y-4">
      <h1 className="text-center text-2xl font-bold">{t.verifyTitle}</h1>
      <p className="text-center text-gray-600">{t.verifyDescription}</p>

      <div className="rounded-md bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          {t.verifyEmail}: <strong>{email}</strong>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <ResendButton t={t} />
      </form>

      {state?.success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{t.resendSuccess}</p>
        </div>
      )}

      {state?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700" role="alert">{state.error}</p>
        </div>
      )}

      <div className="text-center">
        <Link href={`/${lang}/dashboard`} className="text-sm text-blue-600 hover:text-blue-800">
          {t.goToDashboard}
        </Link>
      </div>
    </div>
  );
}

function ResendButton({ t }: { t: Pick<Dictionary["auth"]["emailVerification"], "resendButton" | "resendLoading"> }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? t.resendLoading : t.resendButton}
    </button>
  );
}
