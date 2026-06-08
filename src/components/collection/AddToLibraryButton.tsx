"use client";

import { useActionState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addToLibrary } from "@/actions/collection";

interface AddToLibraryButtonProps {
  mediaId: string;
  label: string;
}

export function AddToLibraryButton({ mediaId, label }: AddToLibraryButtonProps) {
  const queryClient = useQueryClient();
  const [, formAction, isPending] = useActionState(
    async (_prevState: unknown, _formData: FormData) => {
      const result = await addToLibrary(mediaId, "want_to_watch");
      if (result.success) {
        // Adding from the detail page moves the search-results badge from ADD to
        // IN LIBRARY; evict every library-state entry so the badge refreshes
        // without waiting out the staleTime (#42 D8). This closes the gap left
        // by the old server-component inline action, which could not reach the
        // client React Query cache.
        queryClient.invalidateQueries({ queryKey: ["library-state"] });
      } else {
        toast.error(result.error ?? "Failed to add to library");
      }
      return result;
    },
    null
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="vhs-btn vhs-aberrate disabled:opacity-50"
      >
        {isPending ? "..." : label}
      </button>
    </form>
  );
}
