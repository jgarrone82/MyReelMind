import { getAuthenticatedUser } from "@/lib/auth/server";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface UserMenuProps {
  dict: Dictionary;
  lang: string;
}

export async function UserMenu({ dict, lang }: UserMenuProps) {
  // Server-revalidated identity (#52): the email-verification nudge is driven
  // by email_confirmed_at, so this must not trust the unverified getSession.
  const user = await getAuthenticatedUser();

  if (!user) return null;

  const isEmailUnverified = !user.email_confirmed_at;

  return (
    <div className="flex flex-col items-end gap-2">
      {isEmailUnverified && (
        <div className="rounded-md border border-[var(--vhs-sodium)] bg-transparent px-3 py-2 text-sm text-[var(--vhs-sodium)]">
          <Link href={`/${lang}/verify-email`} className="underline hover:text-[var(--vhs-sodium)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]">
            {dict.auth.emailVerification.resendButton}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/settings`}
          className="text-sm text-[var(--vhs-cream-dim)] hover:text-[var(--vhs-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
          title={dict.nav.settings}
          aria-label={dict.nav.settings}
        >
          {/* Gear icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </Link>
        <span className="text-sm text-[var(--vhs-cream)]">{user.email}</span>
        <LogoutButton lang={lang} dict={dict} />
      </div>
    </div>
  );
}