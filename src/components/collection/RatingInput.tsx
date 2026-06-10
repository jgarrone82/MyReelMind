"use client";

interface RatingInputProps {
  rating: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
  dict?: {
    rated: string;
    notRated: string;
    clear: string;
  };
}

export function RatingInput({ rating, onChange, disabled, dict }: RatingInputProps) {
  const labels = dict ?? {
    rated: "Rated",
    notRated: "Not rated",
    clear: "Clear",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="vhs-mono text-sm text-[var(--vhs-cream)]">
          {rating !== null ? `${labels.rated} ${rating} / 10` : labels.notRated}
        </span>
        {rating !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Clear rating"
            className="vhs-mono text-sm text-[var(--vhs-error)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {labels.clear}
          </button>
        )}
      </div>

      <div
        className="flex flex-wrap gap-1"
        role="group"
        aria-label="Rating selection"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            disabled={disabled}
            aria-label={`Rate ${value}`}
            aria-pressed={rating === value}
            className={`vhs-mono flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[2px] border-2 border-[var(--vhs-ground-3)] text-sm transition-colors duration-[90ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--vhs-phosphor)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--vhs-ground)] ${
              rating === value
                ? // WCAG AA (#48): deep-ink on neon magenta = 5.58:1; cream-on-magenta
                  // (2.98:1) failed AA for this small selected toggle.
                  "bg-[var(--vhs-magenta)] text-[var(--vhs-ground)]"
                : "bg-[var(--vhs-ground-2)] text-[var(--vhs-cream-dim)] hover:text-[var(--vhs-cream)]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
