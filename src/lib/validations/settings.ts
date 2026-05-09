import { z } from "zod";

/**
 * Validation schema for the user settings / profile update form.
 *
 * Fields:
 * - displayName: 1–50 trimmed characters (required)
 * - avatarUrl: valid URL string or null (optional)
 * - isPublic: boolean
 */
export const settingsSchema = z.object({
  displayName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .transform((v) => v.trim())
    .refine((v) => v.length >= 1 && v.length <= 50, {
      message: "Name must be 1–50 characters after trimming",
    }),

  avatarUrl: z
    .string()
    .url("Invalid URL")
    .nullable()
    .transform((v) => (v === "" ? null : v)),

  isPublic: z.boolean(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;