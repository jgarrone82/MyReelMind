"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { settingsSchema } from "@/lib/validations/settings";

export type SettingsState = {
  error?: string;
  success?: boolean;
};

/**
 * Updates the authenticated user's profile (displayName, avatarUrl, isPublic).
 *
 * Returns { success: true } on success.
 * Returns { error: "unauthorized" } when no session exists.
 * Returns { error: "name_required" | "name_too_long" | "invalid_url" } on validation failure.
 */
export async function updateProfile(
  prevState: SettingsState | undefined,
  formData: FormData
): Promise<SettingsState> {
  const session = await getSession();
  if (!session?.user) {
    return { error: "unauthorized" };
  }

  const raw = {
    displayName: formData.get("displayName") as string | null,
    avatarUrl: formData.get("avatarUrl") as string | null,
    isPublic: formData.get("isPublic") === "true",
  };

  const parsed = settingsSchema.safeParse(raw);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue.path.includes("displayName")) {
      if (issue.message.includes("required") || issue.code === "invalid_type") {
        return { error: "name_required" };
      }
      if (issue.code === "too_big" && (issue.maximum as number) === 50) {
        return { error: "name_too_long" };
      }
    }
    if (issue.path.includes("avatarUrl")) {
      return { error: "invalid_url" };
    }
    return { error: "invalid_input" };
  }

  await db
    .update(users)
    .set({
      displayName: parsed.data.displayName,
      avatarUrl: parsed.data.avatarUrl,
      isPublic: parsed.data.isPublic,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));

  revalidatePath("/settings");
  revalidatePath(`/users/${session.user.id}`);

  return { success: true };
}