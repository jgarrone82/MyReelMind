"use client";

import { useActionState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StatusSelector } from "@/components/collection/StatusSelector";
import { RatingInput } from "@/components/collection/RatingInput";
import { ProgressTracker } from "@/components/collection/ProgressTracker";
import { updateStatus, updateRating, updateProgress } from "@/actions/collection";
import type { WatchStatus } from "@/components/collection/StatusSelector";

interface MediaDetailClientProps {
  mediaId: string;
  initialStatus: WatchStatus;
  initialProgress: number;
  initialRating: number | null;
  episodes: number | null;
  type: "movie" | "tv" | "anime";
  dict: {
    collection: string;
    status: {
      want_to_watch: string;
      watching: string;
      completed: string;
      paused: string;
      dropped: string;
    };
    statusLabel: string;
    progress: string;
    episode: string;
    chapter: string;
    of: string;
    rating: string;
    yourRating: string;
    notRated: string;
    clear: string;
    markedCompleted: string;
    statusUpdated: string;
    ratingUpdated: string;
    progressUpdated: string;
  };
}

export function MediaDetailClient({
  mediaId,
  initialStatus,
  initialProgress,
  initialRating,
  episodes,
  type,
  dict,
}: MediaDetailClientProps) {
  const queryClient = useQueryClient();

  const [, updateStatusAction] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const newStatus = formData.get("status") as WatchStatus;
      const result = await updateStatus(mediaId, newStatus);
      if (result.success) {
        // A status change can move the search-results badge between bands
        // (e.g. want_to_watch → watching = IN LIBRARY → IN PROGRESS), so evict
        // every library-state entry; the prefix predicate covers all id-set
        // variants. Rating/progress changes never alter the badge band, so they
        // do not invalidate (#42 D8 call-site inventory).
        queryClient.invalidateQueries({ queryKey: ["library-state"] });
        toast.success(dict.statusUpdated);
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
      return result;
    },
    null
  );

  const [, updateRatingAction] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const rating = parseInt(formData.get("rating") as string, 10);
      const result = await updateRating(mediaId, rating);
      if (result.success) {
        toast.success(dict.ratingUpdated);
      } else {
        toast.error(result.error ?? "Failed to update rating");
      }
      return result;
    },
    null
  );

  const [, updateProgressAction] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const progress = parseInt(formData.get("progress") as string, 10);
      const result = await updateProgress(mediaId, progress, episodes ?? undefined);
      if (result.success) {
        // Check if auto-completed (this is a simplification - in real app would need to check response)
        toast.success(dict.progressUpdated);
      } else {
        toast.error(result.error ?? "Failed to update progress");
      }
      return result;
    },
    null
  );

  const handleStatusChange = (newStatus: WatchStatus) => {
    const formData = new FormData();
    formData.set("status", newStatus);
    updateStatusAction(formData);
  };

  const handleRatingChange = (rating: number | null) => {
    if (rating === null) return;
    const formData = new FormData();
    formData.set("rating", String(rating));
    updateRatingAction(formData);
  };

  const handleProgressChange = (progress: number) => {
    const formData = new FormData();
    formData.set("progress", String(progress));
    updateProgressAction(formData);
  };

  const statusDict = {
    want_to_watch: dict.status.want_to_watch,
    watching: dict.status.watching,
    completed: dict.status.completed,
    paused: dict.status.paused,
    dropped: dict.status.dropped,
    label: dict.statusLabel,
  };

  const ratingDict = {
    rated: dict.yourRating,
    notRated: dict.notRated,
    clear: dict.clear,
  };

  const progressDict = {
    progress: dict.progress,
    episode: dict.episode,
    chapter: dict.chapter,
    of: dict.of,
  };

  return (
    <div className="mt-8 space-y-4 rounded-[2px] border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] p-4 shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
      <h2 className="vhs-kicker text-base text-[var(--vhs-cream)]">
        {dict.collection}
      </h2>
      <form action={updateStatusAction}>
        <input type="hidden" name="mediaId" value={mediaId} />
        <StatusSelector
          status={initialStatus}
          onChange={handleStatusChange}
          dict={statusDict}
        />
      </form>
      <RatingInput
        rating={initialRating}
        onChange={handleRatingChange}
        dict={ratingDict}
      />
      <ProgressTracker
        progress={initialProgress}
        total={episodes}
        onChange={handleProgressChange}
        mediaType={type}
        dict={progressDict}
      />
    </div>
  );
}