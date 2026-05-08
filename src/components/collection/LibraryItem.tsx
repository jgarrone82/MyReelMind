"use client";

import { useActionState, useRef } from "react";
import { toast } from "sonner";
import { StatusSelector } from "./StatusSelector";
import { RatingInput } from "./RatingInput";
import { ProgressTracker } from "./ProgressTracker";
import { RemoveButton } from "./RemoveButton";
import { updateStatus, updateRating, updateProgress } from "@/actions/collection";
import type { WatchStatus } from "./StatusSelector";

interface LibraryItemProps {
  id: string;
  mediaId: string;
  publicId: string;
  title: string;
  posterPath: string | null;
  status: WatchStatus;
  progress: number;
  rating: number | null;
  type: "movie" | "tv" | "anime";
  runtime: number | null;
  lang: string;
  dict: {
    remove: string;
    removeConfirm: string;
    cancel?: string;
    noEpisodes: string;
    statusUpdated: string;
    ratingUpdated: string;
    progressUpdated: string;
    removed: string;
    error: string;
  };
}

export function LibraryItem({
  id,
  mediaId,
  publicId,
  title,
  posterPath,
  status: initialStatus,
  progress: initialProgress,
  rating: initialRating,
  type,
  runtime,
  lang,
  dict,
}: LibraryItemProps) {
  // Status update
  const [statusState, updateStatusAction, isStatusPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const newStatus = formData.get("status") as WatchStatus;
      const result = await updateStatus(mediaId, newStatus);
      if (result.success) {
        toast.success(dict.statusUpdated);
      } else {
        toast.error(result.error ?? dict.error);
      }
      return result;
    },
    null
  );

  // Rating update
  const [ratingState, updateRatingAction, isRatingPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const rating = parseInt(formData.get("rating") as string, 10);
      const result = await updateRating(mediaId, rating);
      if (result.success) {
        toast.success(dict.ratingUpdated);
      } else {
        toast.error(result.error ?? dict.error);
      }
      return result;
    },
    null
  );

  // Progress update
  const [progressState, updateProgressAction, isProgressPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const progress = parseInt(formData.get("progress") as string, 10);
      const result = await updateProgress(mediaId, progress, runtime ?? undefined);
      if (result.success) {
        toast.success(dict.progressUpdated);
      } else {
        toast.error(result.error ?? dict.error);
      }
      return result;
    },
    null
  );

  const ratingFormRef = useRef<HTMLFormElement>(null);
  const progressFormRef = useRef<HTMLFormElement>(null);

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

  const isPending = isStatusPending || isRatingPending || isProgressPending;

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {/* Poster */}
      {posterPath && (
        <img
          src={posterPath}
          alt={title ?? "Media poster"}
          className="h-24 w-16 flex-shrink-0 rounded object-cover"
        />
      )}

      {/* Info and controls */}
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-medium">{title}</h3>

        <div className="flex flex-wrap gap-4">
          {/* Status */}
          <form action={updateStatusAction}>
            <input type="hidden" name="mediaId" value={mediaId} />
            <StatusSelector
              status={initialStatus}
              onChange={handleStatusChange}
              disabled={isStatusPending}
            />
          </form>

          {/* Rating */}
          <RatingInput
            rating={initialRating}
            onChange={handleRatingChange}
            disabled={isRatingPending}
          />

          {/* Progress */}
          {type !== "movie" && runtime !== null && runtime > 0 && (
            <ProgressTracker
              progress={initialProgress}
              total={runtime}
              onChange={handleProgressChange}
              disabled={isProgressPending}
            />
          )}
        </div>
      </div>

      {/* Remove button */}
      <div className="flex-shrink-0">
        <RemoveButton
          mediaId={mediaId}
          dict={{ remove: dict.remove, removeConfirm: dict.removeConfirm, cancel: dict.cancel }}
          onSuccess={() => toast.success(dict.removed)}
        />
      </div>
    </div>
  );
}