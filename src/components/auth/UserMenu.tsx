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
        <div className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          <Link href={`/${lang}/verify-email`} className="underline hover:text-yellow-900">
            {dict.auth.emailVerification.resendButton}
          </Link>
        </div>
      )}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{session.user.email}</span>
        <LogoutButton dict={dict} />
      </div>
    </div>
  );
}