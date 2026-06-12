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
        <span className="vhs-mono text-sm text-[var(--vhs-cream-dim)]">
          {dict.removeConfirm}
        </span>
        <form action={formAction}>
          <input type="hidden" name="mediaId" value={mediaId} />
          {/* Destructive confirm (D5): error red + cream clears AA — the #48
              magenta-specific deep-ink rule does not apply to the error token.
              Magenta-on-ground is reserved for selected/active toggles. */}
          <button
            type="submit"
            disabled={isPending}
            className="vhs-mono rounded-[2px] border-2 border-[var(--vhs-error)] bg-[var(--vhs-error)] px-3 py-1 text-sm text-[var(--vhs-cream)] hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
          >
            {isPending ? "..." : dict.remove}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="vhs-btn vhs-focus vhs-btn--secondary vhs-btn--compact"
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
      className="vhs-mono rounded-[2px] text-sm text-[var(--vhs-error)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)]"
      aria-label={dict.remove}
    >
      {dict.remove}
    </button>
  );
}