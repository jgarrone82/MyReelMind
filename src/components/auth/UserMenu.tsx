import { getSession } from "@/lib/auth/server";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface UserMenuProps {
  dict: Dictionary;
  lang: string;
}

export async function UserMenu({ dict, lang }: UserMenuProps) {
  const session = await getSession();

  if (!session?.user) return null;

  const isEmailUnverified = !session.user.email_confirmed_at;

  return (
    <div className="flex flex-col items-end gap-2">
      {isEmailUnverified && (
        <div className="rounded-md bg-warning px-3 py-2 text-sm text-warning-foreground">
          <Link href={`/${lang}/verify-email`} className="underline hover:text-warning-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            {dict.auth.emailVerification.resendButton}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Link
          href={`/${lang}/settings`}
          className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          title={dict.nav.settings}
        >
          {/* Gear icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </Link>
        <span className="text-sm text-foreground">{session.user.email}</span>
        <LogoutButton dict={dict} />
      </div>
    </div>
  );
}