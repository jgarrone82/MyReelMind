interface DashboardSkeletonProps {
  dict: {
    title: string;
  };
}

/**
 * Loading silhouette for the VHS dashboard: a paper receipt member-card block
 * followed by a horizontal shelf of box-card placeholders. Mirrors the live
 * layout's rough shape so the transition into content is calm.
 */
export function DashboardSkeleton({ dict }: DashboardSkeletonProps) {
  return (
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1200px]">
        {/* Title block */}
        <div className="mb-1 h-3 w-24 animate-pulse rounded bg-[var(--vhs-ground-3)]" />
        <h1 className="vhs-display vhs-aberrate m-0 text-[clamp(2.2rem,5vw,3.4rem)] text-[var(--vhs-cream)]">
          {dict.title}
        </h1>
        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[var(--vhs-ground-3)]" />

        {/* Member-card receipt silhouette */}
        <div
          className="mx-auto mt-8 grid w-full max-w-[560px] gap-3 rotate-[-0.6deg] border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-paper)] p-6 shadow-[8px_8px_0_rgba(0,0,0,0.75)]"
          aria-hidden
        >
          <div className="mx-auto h-4 w-48 animate-pulse rounded bg-[rgba(10,8,7,0.18)]" />
          <div className="mt-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-3 w-full animate-pulse rounded bg-[rgba(10,8,7,0.14)]"
              />
            ))}
          </div>
          <div className="mt-3 border-y-2 border-dashed border-[rgba(10,8,7,0.4)] py-3 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3"
              >
                <div className="h-3 w-24 animate-pulse rounded bg-[rgba(10,8,7,0.16)]" />
                <div className="h-6 w-12 animate-pulse rounded bg-[rgba(10,8,7,0.2)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Shelf silhouette */}
        <div className="mt-10">
          <div className="mb-[22px] h-4 w-56 animate-pulse rounded bg-[var(--vhs-ground-3)] border-b-[3px] border-double border-[var(--vhs-cream-dim)] pb-2" />
          <div className="grid grid-flow-col gap-[22px] overflow-hidden [grid-auto-columns:minmax(160px,200px)]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse border-2 border-[var(--vhs-ground-3)] bg-[var(--vhs-ground-2)] shadow-[5px_5px_0_rgba(0,0,0,0.8)]"
                style={{ aspectRatio: "2 / 3" }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
