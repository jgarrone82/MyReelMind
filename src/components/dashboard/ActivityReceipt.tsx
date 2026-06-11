import Link from "next/link";

export type ActivityStatusColor =
  | "magenta"
  | "acid"
  | "sodium"
  | "phosphor"
  | "cream";

const STATUS_COLOR_VAR: Record<ActivityStatusColor, string> = {
  magenta: "var(--vhs-magenta)",
  acid: "var(--vhs-acid)",
  sodium: "var(--vhs-sodium)",
  phosphor: "var(--vhs-phosphor)",
  cream: "var(--vhs-cream)",
};

export interface ActivityReceiptItem {
  /** Stable row id (the user_media row id) — used as the React list key. */
  id: string;
  /** Media title. */
  title: string;
  /** CURRENT status label (e.g. "WATCHING") — never a fabricated event type. */
  statusLabel: string;
  /** Chip background color keyed to the status. */
  statusColor: ActivityStatusColor;
  /** Pre-formatted timestamp derived from updatedAt. */
  timestamp: string;
  /** Optional link to the media detail page. */
  href?: string;
}

export interface ActivityReceiptProps {
  heading: string;
  items: ActivityReceiptItem[];
}

/**
 * Register-tape activity log: a receipt-styled list where each row shows a
 * colored CURRENT-status chip, the media title, and a right-aligned timestamp
 * joined by dotted leaders. Honest-data: status + updatedAt only, no invented
 * event types (no RATED/RESUMED).
 */
export function ActivityReceipt({ heading, items }: ActivityReceiptProps) {
  return (
    <section aria-label={heading} className="mx-auto mt-11 w-full max-w-[1200px]">
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-double border-[var(--vhs-cream-dim)] pb-2">
        <span className="vhs-kicker border-b-[3px] border-[var(--vhs-magenta)] pb-[2px] text-[1.05rem] text-[var(--vhs-magenta)]">
          {heading}
        </span>
      </div>

      <ul className="vhs-mono m-0 max-w-[640px] list-none border-[1.5px] border-[var(--vhs-ground)] bg-[var(--vhs-paper)] px-[18px] py-[20px] text-[var(--vhs-ground)]">
        {items.map((item) => {
          const titleNode = item.href ? (
            <Link
              href={item.href}
              className="font-semibold text-[var(--vhs-ground)] no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--vhs-phosphor)]"
            >
              {item.title}
            </Link>
          ) : (
            <span className="font-semibold text-[var(--vhs-ground)]">
              {item.title}
            </span>
          );

          return (
            <li
              key={item.id}
              className="flex items-baseline gap-[10px] border-b border-dashed border-[rgba(10,8,7,0.28)] py-[7px] last:border-b-0"
            >
              <span
                className="vhs-kicker whitespace-nowrap border-[1.5px] border-[var(--vhs-ground)] px-[7px] pt-[2px] pb-[1px] text-[0.68rem] text-[var(--vhs-ground)] shadow-[2px_2px_0_var(--vhs-ground)]"
                style={{ background: STATUS_COLOR_VAR[item.statusColor] }}
              >
                {item.statusLabel}
              </span>
              <span className="text-[0.85rem]">{titleNode}</span>
              <span
                aria-hidden
                className="translate-y-[-3px] flex-1 border-b-2 border-dotted border-[rgba(10,8,7,0.3)]"
              />
              <span className="whitespace-nowrap text-[0.7rem] text-[var(--vhs-ground)] opacity-65">
                {item.timestamp}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
