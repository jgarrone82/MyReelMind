interface TapeSkeletonProps {
  /** Number of placeholder tape cards to render. */
  count?: number;
}

/**
 * Decorative loading placeholder: a shelf of VHS "tape" cards used while
 * search results stream in. Purely cosmetic — the surrounding status region
 * announces the loading state, so the grid is aria-hidden.
 */
export function TapeSkeleton({ count = 10 }: TapeSkeletonProps) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="tape-skeleton">
          <div className="sk-strip" />
          <div className="sk-poster" />
          <div className="sk-foot" />
        </div>
      ))}
    </div>
  );
}
