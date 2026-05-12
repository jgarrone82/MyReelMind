interface TypeBarProps {
  stats: { type: "movie" | "tv" | "anime"; count: number }[];
  mediaDict: {
    movie: string;
    tv: string;
    anime: string;
  };
}

export function TypeBar({ stats, mediaDict }: TypeBarProps) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  const typeLabels: Record<string, string> = {
    movie: mediaDict.movie,
    tv: mediaDict.tv,
    anime: mediaDict.anime,
  };

  if (total === 0) return null;

  return (
    <div className="space-y-2">
      {stats.map((stat) => {
        const percentage = total > 0 ? (stat.count / total) * 100 : 0;
        return (
          <div key={stat.type} className="flex items-center gap-3">
            <span className="w-20 text-sm text-gray-600 capitalize">
              {typeLabels[stat.type]}
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-10 text-sm text-gray-900 text-right">
              {stat.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}