interface GenreCloudProps {
  stats: { genre: string; count: number }[];
}

export function GenreCloud({ stats }: GenreCloudProps) {
  if (stats.length === 0) return null;

  const maxCount = Math.max(...stats.map((s) => s.count));

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat) => {
        const weight = maxCount > 1 ? (stat.count - 1) / (maxCount - 1) : 1;
        const fontSize = 0.875 + weight * 0.5;

        return (
          <span
            key={stat.genre}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
            style={{ fontSize: `${fontSize}rem` }}
          >
            {stat.genre}
            <span className="text-xs text-gray-500">({stat.count})</span>
          </span>
        );
      })}
    </div>
  );
}