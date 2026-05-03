"use client";

import { signOut } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/i18n/types";

interface LogoutButtonProps {
  dict: Dictionary;
}

export function LogoutButton({ dict }: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <form action={signOut}>
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 min-h-[44px]"
      >
        {pending ? dict.common.loading : dict.auth.logout}
      </button>
    </form>
  );
}