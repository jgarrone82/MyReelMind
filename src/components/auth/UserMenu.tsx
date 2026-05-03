import { getSession } from "@/lib/auth/server";
import { LogoutButton } from "./LogoutButton";
import type { Dictionary } from "@/i18n/types";

interface UserMenuProps {
  dict: Dictionary;
}

export async function UserMenu({ dict }: UserMenuProps) {
  const session = await getSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700">{session.user.email}</span>
      <LogoutButton dict={dict} />
    </div>
  );
}