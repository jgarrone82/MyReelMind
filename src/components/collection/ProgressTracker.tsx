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
      <label htmlFor="progress-input" className="block text-sm font-medium text-primary">
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
          className="w-24 rounded-md border border-primary px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-muted"
        />
        <span className="text-sm text-secondary">
          {total !== null
            ? `${unit} ${progress} ${ofLabel} ${total}`
            : `${unit} ${progress}`}
        </span>
      </div>
    </div>
  );
}
