"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/i18n/types";

interface ResetPasswordFormProps {
  dict: Dictionary;
}

export function ResetPasswordForm({ dict }: ResetPasswordFormProps) {
  const [state, action] = useActionState(updatePassword, null);
  const t = dict.auth.passwordReset;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t.newPassword}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          {t.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <SubmitButton t={t} />

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}

function SubmitButton({ t }: { t: Pick<Dictionary["auth"]["passwordReset"], "updatePassword" | "updatingPassword"> }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? t.updatingPassword : t.updatePassword}
    </button>
  );
}
