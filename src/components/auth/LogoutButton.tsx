"use client";

import { signOut } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import type { Dictionary } from "@/i18n/types";

interface LogoutButtonProps {
  lang: string;
  dict: Dictionary;
}

export function LogoutButton({ lang, dict }: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    // Bind the active locale so the post-logout redirect stays on the current
    // locale instead of being bounced to the default locale by the middleware.
    <form action={signOut.bind(null, lang)}>
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1 text-sm text-[var(--vhs-error)] hover:text-[var(--vhs-error)]/80 disabled:opacity-50 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
      >
        {pending ? dict.common.loading : dict.auth.logout}
      </button>
    </form>
  );
}