"use client";

interface RatingInputProps {
  rating: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
}

export function RatingInput({ rating, onChange, disabled }: RatingInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {rating !== null ? `Rated ${rating} / 10` : "Not rated"}
        </span>
        {rating !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            aria-label="Clear rating"
            className="text-sm text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Clear
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
            className={`h-9 w-9 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              rating === value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
