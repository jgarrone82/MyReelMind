"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { removeFromLibrary } from "@/actions/collection";

interface RemoveButtonProps {
  mediaId: string;
  onSuccess?: () => void;
  dict: {
    remove: string;
    removeConfirm: string;
    error?: string;
  };
}

export function RemoveButton({ mediaId, onSuccess, dict }: RemoveButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const result = await removeFromLibrary(mediaId);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error ?? dict.error ?? "Failed to remove");
      }
      return result;
    },
    null
  );

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{dict.removeConfirm}</span>
        <form action={formAction}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "..." : dict.remove}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="rounded text-red-600 hover:text-red-800"
      aria-label={dict.remove}
    >
      {dict.remove}
    </button>
  );
}