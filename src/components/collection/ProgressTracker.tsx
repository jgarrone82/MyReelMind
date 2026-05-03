"use client";

interface ProgressTrackerProps {
  progress: number;
  total: number | null;
  onChange: (progress: number) => void;
  disabled?: boolean;
}

export function ProgressTracker({ progress, total, onChange, disabled }: ProgressTrackerProps) {
  return (
    <div>
      <span>Progress: {progress}{total ? ` / ${total}` : ""}</span>
      <input
        type="number"
        value={progress}
        onChange={(e) => onChange(Number(e.target.value))}
        min={0}
        max={total ?? undefined}
        disabled={disabled}
        aria-label="Progress"
      />
    </div>
  );
}
