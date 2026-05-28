import type { ReactNode } from "react";

interface UnfoldedVHSProps {
  backCover: ReactNode;
  spine: ReactNode;
  frontCover: ReactNode;
}

export function UnfoldedVHS({ backCover, spine, frontCover }: UnfoldedVHSProps) {
  return (
    <div
      className="relative mx-auto grid w-full max-w-[1200px] -rotate-[0.4deg] grid-cols-1 border-2 border-[var(--vhs-ground)] bg-[var(--vhs-paper)] text-[var(--vhs-ground)] shadow-[12px_12px_0_rgba(0,0,0,0.7)] lg:grid-cols-[minmax(0,1.65fr)_64px_minmax(0,1fr)]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 30% 20%, rgba(255,138,61,0.08), transparent 60%)," +
          "radial-gradient(ellipse at 80% 80%, rgba(74,255,240,0.05), transparent 65%)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.15 0 0 0 0 0.1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {backCover}
      {spine}
      {frontCover}
    </div>
  );
}
