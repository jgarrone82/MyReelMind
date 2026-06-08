"use client";

import { useActionState, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeFromLibrary } from "@/actions/collection";

interface RemoveButtonProps {
  mediaId: string;
  onSuccess?: () => void;
  dict: {
    remove: string;
    removeConfirm: string;
    cancel?: string;
    error?: string;
  };
}

export function RemoveButton({ mediaId, onSuccess, dict }: RemoveButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const queryClient = useQueryClient();
  const [, formAction, isPending] = useActionState(
    async (_prevState: unknown, _formData: FormData) => {
      const result = await removeFromLibrary(mediaId);
      if (result.success) {
        // Removal moves the search-results badge back to ADD; evict every
        // library-state entry so it refreshes without a reload (#42 D8).
        queryClient.invalidateQueries({ queryKey: ["library-state"] });
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
        <span className="text-sm text-secondary">{dict.removeConfirm}</span>
        <form action={formAction}>
          <input type="hidden" name="mediaId" value={mediaId} />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-error px-3 py-1 text-sm text-white hover:bg-error/80 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {isPending ? "..." : dict.remove}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="rounded bg-muted px-3 py-1 text-sm text-primary hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {dict.cancel ?? "Cancel"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowConfirm(true)}
      className="rounded text-error hover:text-error/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      aria-label={dict.remove}
    >
      {dict.remove}
    </button>
  );
}