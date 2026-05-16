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
        <span className="text-sm font-medium text-foreground">
          {rating !== null ? `${labels.rated} ${rating} / 10` : labels.notRated}
        </span>
        {rating !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Clear rating"
            className="text-sm text-error hover:text-error/70 disabled:cursor-not-allowed disabled:text-muted-foreground"
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
            className={`h-9 w-9 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              rating === value
                ? "bg-accent text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            } disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
