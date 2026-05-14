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
      <label htmlFor="watch-status" className="block text-sm font-medium text-gray-700">
        {labels.label ?? "Status"}
      </label>
      <select
        id="watch-status"
        value={status}
        onChange={(e) => onChange(e.target.value as WatchStatus)}
        disabled={disabled}
        aria-label="Watch status"
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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
