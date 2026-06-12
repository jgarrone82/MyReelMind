import Link from "next/link";
import type { Dictionary } from "@/i18n/types";

interface GuestWelcomeProps {
  lang: string;
  dict: Dictionary;
}

/**
 * Honest logged-OUT landing for the home route `/[lang]`. Rendered by
 * DashboardContent BEFORE any data fetch when there is no authenticated user.
 *
 * This is deliberately NOT the members-only "STORE CLOSED" panel (that one is
 * reserved for a genuine logged-IN member with an empty library): a visitor is
 * not a member, so showing them a members-only empty shelf is dishonest and
 * conflates two distinct states (#76, #800, #853). The copy welcomes the guest
 * and offers the two account CTAs — sign in (primary) and sign up (secondary).
 *
 * Server component — no interactivity, just brand + locale-prefixed links.
 * Styling reuses the established VHS idiom (vhs-display / vhs-kicker /
 * vhs-mono / vhs-btn / vhs-focus / vhs-aberrate / vhs-btn--secondary and the
 * var(--vhs-*) tokens) so it sits flush with the rest of the surface.
 */
export function GuestWelcome({ lang, dict }: GuestWelcomeProps) {
  const t = dict.dashboard.guest;

  return (
    <main className="vhs-scanlines vhs-crt relative min-h-screen bg-[var(--vhs-ground)] px-4 py-10 text-[var(--vhs-cream)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-[1200px] flex-col items-center justify-center gap-6 text-center">
        <div className="vhs-kicker text-[0.8rem] text-[var(--vhs-sodium)]">
          {t.kicker}
        </div>

        <h1 className="vhs-display vhs-aberrate m-0 text-[clamp(2.2rem,5vw,3.4rem)] text-[var(--vhs-cream)]">
          {t.headline}
        </h1>

        <p className="vhs-mono m-0 max-w-[540px] text-[0.95rem] leading-relaxed text-[var(--vhs-cream-dim)]">
          {t.body}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-[14px]">
          <Link
            href={`/${lang}/login`}
            className="vhs-btn vhs-focus vhs-aberrate"
          >
            {t.signIn}
          </Link>
          <Link
            href={`/${lang}/signup`}
            className="vhs-btn vhs-focus vhs-btn--secondary"
          >
            {t.signUp}
          </Link>
        </div>
      </div>
    </main>
  );
}
