import Link from "next/link";
import { Barcode } from "@/components/vhs";

export type MemberCardStatAccent = "magenta" | "phosphor" | "sodium" | "acid";

const STAT_ACCENT_VAR: Record<MemberCardStatAccent, string> = {
  magenta: "var(--vhs-magenta)",
  phosphor: "var(--vhs-phosphor)",
  sodium: "var(--vhs-sodium)",
  acid: "var(--vhs-acid)",
};

export interface MemberCardStat {
  /** Pre-localized stat label, e.g. "Hours watched". */
  label: string;
  /** Pre-formatted value (hours already rendered as "x.x"). */
  value: string;
  /** Drill-down link to a filtered library view. */
  href: string;
  /** Accent swatch / number drop-shadow color. */
  accent: MemberCardStatAccent;
}

export interface MemberCardReceiptProps {
  /** Card title, e.g. "MYREELMIND MEMBER CARD". */
  title: string;
  /** Optional sub-line under the title, e.g. "STORE #0485 · AISLE-ANYTIME". */
  storeLabel?: string;

  memberLabel: string;
  memberName: string;
  memberSinceLabel: string;
  memberSince: string;
  cardNoLabel: string;
  cardNo: string;

  tallyLabel: string;
  /** Optional dated sub-line under the tally heading. */
  tallyDate?: string;
  stats: MemberCardStat[];

  subtotalLabel: string;
  subtotalValue: string;

  thankYou: string;
  drillHint: string;
}

/**
 * The anchor of the dashboard: a dot-matrix paper RECEIPT styled as a video-store
 * member card. Member meta, a four-line drillable tally with dot leaders, a
 * subtotal, a deterministic barcode and a hand-lettered thank-you.
 */
export function MemberCardReceipt({
  title,
  storeLabel,
  memberLabel,
  memberName,
  memberSinceLabel,
  memberSince,
  cardNoLabel,
  cardNo,
  tallyLabel,
  tallyDate,
  stats,
  subtotalLabel,
  subtotalValue,
  thankYou,
  drillHint,
}: MemberCardReceiptProps) {
  return (
    <section
      aria-label={title}
      className="mx-auto mb-2 grid w-full max-w-[560px] rotate-[-0.6deg] grid-cols-1"
    >
      <div className="vhs-mono border-2 border-[var(--vhs-ground)] bg-[var(--vhs-paper)] px-[18px] pt-[22px] pb-[22px] text-[var(--vhs-ground)] shadow-[8px_8px_0_rgba(0,0,0,0.75)]">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="vhs-kicker text-[0.92rem] tracking-[0.16em] text-[var(--vhs-ground)]">
            {title}
          </div>
          {storeLabel ? (
            <div className="mt-[2px] text-[0.68rem] text-[var(--vhs-ground)] opacity-60">
              {storeLabel}
            </div>
          ) : null}
        </div>

        {/* Member meta */}
        <dl className="m-0">
          <MetaRow label={memberLabel} value={memberName} />
          <MetaRow label={memberSinceLabel} value={memberSince} />
          <MetaRow label={cardNoLabel} value={cardNo} />
        </dl>

        {/* Tally header */}
        <div className="mx-0 mt-[14px] mb-[6px] text-center text-[0.78rem] font-bold tracking-[0.14em] text-[var(--vhs-ground)]">
          {tallyLabel}
          {tallyDate ? (
            <div className="mt-[2px] text-[0.64rem] font-normal tracking-[0.08em] opacity-60">
              {tallyDate}
            </div>
          ) : null}
        </div>

        {/* The drillable stat lines — printed-off-register numbers */}
        <div className="border-y-2 border-dashed border-[rgba(10,8,7,0.4)] py-2">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex items-baseline justify-between gap-2 px-[2px] py-[6px] no-underline transition-colors duration-75 hover:bg-[rgba(10,8,7,0.06)] focus-visible:bg-[rgba(10,8,7,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--vhs-phosphor)]"
              title={drillHint}
            >
              <span className="flex items-center gap-2 text-[0.86rem] uppercase tracking-[0.02em] text-[var(--vhs-ground)]">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 border border-[var(--vhs-ground)]"
                  style={{ background: STAT_ACCENT_VAR[stat.accent] }}
                />
                {stat.label}
              </span>
              <span
                aria-hidden
                className="mx-2 flex-1 translate-y-[-4px] border-b-2 border-dotted border-[rgba(10,8,7,0.35)]"
              />
              <span
                className="vhs-display text-[1.7rem] leading-none text-[var(--vhs-ground)]"
                style={{ textShadow: `2px 2px 0 ${STAT_ACCENT_VAR[stat.accent]}` }}
              >
                {stat.value}
              </span>
            </Link>
          ))}
        </div>

        {/* Subtotal */}
        <div className="mt-2 flex justify-between font-bold">
          <span className="tracking-[0.06em]">{subtotalLabel}</span>
          <span className="text-[1rem]">{subtotalValue}</span>
        </div>

        {/* Barcode */}
        <div className="mt-3">
          <Barcode seed={`MRM-${cardNo}-MEMBER`} />
          <div className="mt-[6px] text-center text-[0.66rem] tracking-[0.2em] text-[var(--vhs-ground)]">
            {cardNo}
          </div>
        </div>

        <div className="vhs-script mt-[10px] rotate-[-1.5deg] text-center text-[1.05rem] text-[var(--vhs-magenta)]">
          {thankYou}
        </div>
        <div className="mt-1 text-center text-[0.62rem] text-[var(--vhs-ground)] opacity-55">
          {drillHint}
        </div>
      </div>
    </section>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed border-[rgba(10,8,7,0.3)] py-[3px] text-[0.78rem] last:border-b-0">
      <dt className="opacity-70">{label}</dt>
      <dd className="m-0 font-semibold">{value}</dd>
    </div>
  );
}
