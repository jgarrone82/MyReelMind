"use client";

interface ProgressTrackerProps {
  progress: number;
  total: number | null;
  onChange: (progress: number) => void;
  disabled?: boolean;
  mediaType?: "movie" | "tv" | "anime" | "manga";
  dict?: {
    progress: string;
    episode?: string;
    chapter?: string;
    of: string;
  };
}

export function ProgressTracker({
  progress,
  total,
  onChange,
  disabled,
  mediaType = "anime",
  dict,
}: ProgressTrackerProps) {
  const isManga = mediaType === "manga";
  const unit = dict
    ? isManga
      ? dict.chapter ?? "Chapter"
      : dict.episode ?? "Episode"
    : isManga
      ? "Chapter"
      : "Episode";
  const ofLabel = dict?.of ?? "of";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor="progress-input"
        className="vhs-kicker block text-[0.72rem] text-[var(--vhs-cream-dim)]"
      >
        {dict?.progress ?? "Progress"}
      </label>
      <div className="flex items-center gap-3">
        <input
          id="progress-input"
          type="number"
          value={progress}
          onChange={handleChange}
          min={0}
          max={total ?? undefined}
          disabled={disabled}
          aria-label="Progress"
          className="vhs-input vhs-input--inline text-sm"
        />
        <span className="vhs-mono text-sm text-[var(--vhs-cream-dim)]">
          {total !== null
            ? `${unit} ${progress} ${ofLabel} ${total}`
            : `${unit} ${progress}`}
        </span>
      </div>
    </div>
  );
}
