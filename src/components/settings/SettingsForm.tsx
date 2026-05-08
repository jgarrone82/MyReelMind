"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/settings";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import type { Dictionary } from "@/i18n/types";
import { useEffect } from "react";
import Image from "next/image";

interface SettingsFormProps {
  dict: Dictionary;
  initialValues: {
    displayName: string;
    avatarUrl: string | null;
    isPublic: boolean;
  };
}

export function SettingsForm({ dict, initialValues }: SettingsFormProps) {
  const [state, action] = useActionState(updateProfile, undefined);
  const [previewUrl, setPreviewUrl] = useState(initialValues.avatarUrl);
  const s = dict.settings;

  // Show toast on success
  useEffect(() => {
    if (state?.success) {
      toast(s.saved);
    }
  }, [state, s.saved]);

  return (
    <form action={action} className="space-y-6 max-w-md mx-auto">
      {/* Display Name */}
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          {s.displayName}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          minLength={1}
          maxLength={50}
          defaultValue={initialValues.displayName}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">
          {s.avatarUrl}
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={initialValues.avatarUrl ?? ""}
          onChange={(e) => setPreviewUrl(e.target.value || null)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {/* Avatar preview */}
        <div className="mt-2">
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Avatar preview"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Public profile toggle */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">{s.privacy}</p>
        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            value="true"
            defaultChecked={initialValues.isPublic}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700">
            {s.publicProfile}
          </label>
        </div>
      </div>

      {/* Error message */}
      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage(state.error, dict)}
        </p>
      )}

      <SubmitButton dict={dict} />
    </form>
  );
}

function errorMessage(error: string, dict: Dictionary): string {
  const map: Record<string, string> = {
    name_required: dict.settings.errorNameRequired,
    name_too_long: dict.settings.errorNameLength,
    invalid_url: dict.settings.errorInvalidUrl,
    unauthorized: dict.settings.errorUnauthorized,
  };
  return map[error] ?? dict.common.error;
}

function SubmitButton({ dict }: { dict: Dictionary }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
    >
      {pending ? dict.common.loading : dict.settings.save}
    </button>
  );
}