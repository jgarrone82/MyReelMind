"use client";

interface RatingInputProps {
  rating: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
}

export function RatingInput({ rating, onChange, disabled }: RatingInputProps) {
  return (
    <div>
      <span>Rating: {rating ?? "None"}</span>
      <button onClick={() => onChange(5)} disabled={disabled}>Rate 5</button>
      <button onClick={() => onChange(null)} disabled={disabled}>Clear</button>
    </div>
  );
}
