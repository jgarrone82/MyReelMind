import { TypeBar } from "./TypeBar";
import { GenreCloud } from "./GenreCloud";
import { StatusBar } from "./StatusBar";

interface StatsBreakdownProps {
  statsByType: { type: "movie" | "tv" | "anime"; count: number }[];
  statsByGenre: { genre: string; count: number }[];
  statsByStatus: {
    status: "want_to_watch" | "watching" | "completed" | "paused" | "dropped";
    count: number;
  }[];
  dict: {
    statsByType: string;
    statsByGenre: string;
    statsByStatus: string;
  };
  mediaDict: {
    movie: string;
    tv: string;
    anime: string;
  };
  statusDict: {
    want_to_watch: string;
    watching: string;
    completed: string;
    paused: string;
    dropped: string;
  };
}

function BreakdownCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

export function StatsBreakdown({
  statsByType,
  statsByGenre,
  statsByStatus,
  dict,
  mediaDict,
  statusDict,
}: StatsBreakdownProps) {
  return (
    <section
      aria-label="Stats breakdown"
      className="grid gap-4 sm:grid-cols-3"
    >
      <BreakdownCard title={dict.statsByType}>
        <TypeBar stats={statsByType} mediaDict={mediaDict} />
      </BreakdownCard>

      <BreakdownCard title={dict.statsByGenre}>
        <GenreCloud stats={statsByGenre} />
      </BreakdownCard>

      <BreakdownCard title={dict.statsByStatus}>
        <StatusBar stats={statsByStatus} dict={statusDict} />
      </BreakdownCard>
    </section>
  );
}