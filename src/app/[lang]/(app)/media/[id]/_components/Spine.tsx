interface SpineProps {
  catalog: string;
  catalogSub?: string;
  formatLabel?: string;
}

export function Spine({
  catalog,
  catalogSub,
  formatLabel = "VHS · NTSC",
}: SpineProps) {
  return (
    <div className="relative flex flex-col items-center justify-between overflow-hidden border-l border-r border-dashed border-[rgba(10,8,7,0.35)] bg-[var(--vhs-ground-2)] px-1 py-[14px] text-[var(--vhs-cream)]">
      <div className="vhs-kicker text-center text-[0.55rem] leading-tight text-[var(--vhs-magenta)]">
        <div
          className="vhs-display mx-auto mb-[6px] grid h-7 w-7 place-items-center border-[1.5px] border-[var(--vhs-cream-dim)] bg-[var(--vhs-magenta)] text-base text-[var(--vhs-cream)]"
          aria-hidden
        >
          M
        </div>
        {catalog}
        {catalogSub ? (
          <>
            <br />
            {catalogSub}
          </>
        ) : null}
      </div>

      <div
        className="vhs-mono text-center text-[0.55rem] leading-tight tracking-wider text-[var(--vhs-cream-dim)] opacity-70"
        aria-hidden
      >
        {formatLabel}
      </div>
    </div>
  );
}
