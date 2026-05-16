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
        className="px-3 py-1 text-sm text-error hover:text-error/80 disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {pending ? dict.common.loading : dict.auth.logout}
      </button>
    </form>
  );
}