interface StatusBarProps {
  stats: { status: "want_to_watch" | "watching" | "completed" | "paused" | "dropped"; count: number }[];
  dict: {
    want_to_watch: string;
    watching: string;
    completed: string;
    paused: string;
    dropped: string;
  };
}

export function StatusBar({ stats, dict }: StatusBarProps) {
  if (stats.length === 0) return null;

  const statusConfig: Record<string, { label: string; color: string }> = {
    want_to_watch: { label: dict.want_to_watch, color: "bg-warning" },
    watching: { label: dict.watching, color: "bg-accent" },
    completed: { label: dict.completed, color: "bg-success" },
    paused: { label: dict.paused, color: "bg-orange-400" },
    dropped: { label: dict.dropped, color: "bg-error" },
  };

  const total = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-2">
      {stats.map((stat) => {
        const config = statusConfig[stat.status];
        if (!config) return null;

        const percentage = total > 0 ? (stat.count / total) * 100 : 0;

        return (
          <div key={stat.status} className="flex items-center gap-3">
            <span className="w-24 text-sm text-secondary truncate">{config.label}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${config.color} rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-10 text-sm text-primary text-right">
              {stat.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}