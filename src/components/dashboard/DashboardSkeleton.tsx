interface DashboardSkeletonProps {
  dict: {
    title: string;
    totalWatched: string;
    totalHours: string;
    recentActivity: string;
    statsByType: string;
    statsByGenre: string;
    statsByStatus: string;
  };
}

export function DashboardSkeleton({ dict }: DashboardSkeletonProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-primary sm:text-3xl">
        {dict.title}
      </h1>

      {/* Stats Grid Skeleton */}
      <section
        aria-label={dict.title}
        className="mb-8 grid gap-4 sm:grid-cols-2"
      >
        <div className="flex flex-col rounded-lg border border-muted bg-primary p-6 shadow-sm animate-pulse">
          <div className="h-4 w-20 bg-muted rounded"></div>
          <div className="h-8 w-16 mt-2 bg-muted rounded"></div>
        </div>
        <div className="flex flex-col rounded-lg border border-muted bg-primary p-6 shadow-sm animate-pulse">
          <div className="h-4 w-20 bg-muted rounded"></div>
          <div className="h-8 w-16 mt-2 bg-muted rounded"></div>
        </div>
      </section>

      {/* Breakdown Skeleton */}
      <section
        aria-label="Stats breakdown"
        className="mb-8 grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-lg border border-muted bg-primary p-4 shadow-sm animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="flex-1 h-2 bg-muted/50 rounded"></div>
                <div className="h-4 w-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-muted bg-primary p-4 shadow-sm animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-4"></div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-muted bg-primary p-4 shadow-sm animate-pulse">
          <div className="h-4 w-24 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="flex-1 h-2 bg-muted/50 rounded"></div>
                <div className="h-4 w-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Feed Skeleton */}
      <section aria-label={dict.recentActivity}>
        <div className="rounded-lg border border-muted bg-primary">
          <div className="border-b border-muted px-4 py-3">
            <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="divide-y divide-muted px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-24 mt-2 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
