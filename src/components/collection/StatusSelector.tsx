"use client";


export type WatchStatus = "want_to_watch" | "watching" | "completed" | "paused" | "dropped";

interface StatusSelectorProps {
  status: WatchStatus;
  onChange: (status: WatchStatus) => void;
  disabled?: boolean;
  dict?: {
    want_to_watch: string;
    watching: string;
    completed: string;
    paused: string;
    dropped: string;
    label?: string;
  };
}

export function StatusSelector({ status, onChange, disabled, dict }: StatusSelectorProps) {
  const labels = dict ?? {
    want_to_watch: "Want to Watch",
    watching: "Watching",
    completed: "Completed",
    paused: "Paused",
    dropped: "Dropped",
    label: "Status",
  };

  return (
    <div className="space-y-1">
      <label htmlFor="watch-status" className="block text-sm font-medium text-primary">
        {labels.label ?? "Status"}
      </label>
      <select
        id="watch-status"
        value={status}
        onChange={(e) => onChange(e.target.value as WatchStatus)}
        disabled={disabled}
        aria-label="Watch status"
        className="block w-full rounded-md border border-primary bg-primary px-3 py-2 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-muted disabled:text-secondary"
      >
        {(Object.keys(labels).filter(k => k !== 'label') as WatchStatus[]).map((key) => (
          <option key={key} value={key}>
            {labels[key]}
          </option>
        ))}
      </select>
    </div>
  );
}
