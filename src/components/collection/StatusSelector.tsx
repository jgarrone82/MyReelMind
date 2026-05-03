"use client";

interface StatusSelectorProps {
  status: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export function StatusSelector({ status, onChange, disabled }: StatusSelectorProps) {
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label="Watch status"
    >
      <option value="want_to_watch">Want to Watch</option>
      <option value="watching">Watching</option>
      <option value="completed">Completed</option>
      <option value="paused">Paused</option>
      <option value="dropped">Dropped</option>
    </select>
  );
}
