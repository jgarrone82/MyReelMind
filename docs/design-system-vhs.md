# MyReelMind — VHS Rental 1985

Design system spec. Paste this whole document as context when prompting Claude Design (or any UI generator) for MyReelMind screens.

---

## 1. Concept

MyReelMind is a personal media tracking app (movies / TV / anime) styled as a **late-80s neighborhood video rental store**. Not synthwave. Not vaporwave. Not Outrun. Those are the AI-cliché versions of this era. We are grounded in the **physical material reality** of a 1985 video store: yellowed VHS box art, dot-matrix receipts, chromatic-aberrated CRT screens, hand-lettered "NEW ARRIVAL" stickers, scanlines on a tube TV, the warm hum of fluorescent tubes, magnetic tape texture.

The product is for one user (the owner) so it can be **bold, opinionated, and unapologetically personal**. No safe palettes. No corporate restraint.

---

## 2. Anti-references — NEVER do these

- ❌ Purple → pink gradient backgrounds (vaporwave AI-slop)
- ❌ Palmera silhouettes, sunsets, Outrun grids
- ❌ Pure white (`#fff`) anywhere — only warm creams
- ❌ Inter, Roboto, Arial, Space Grotesk, system-ui as display fonts
- ❌ Bouncy, playful, "fun" animations — this aesthetic is mechanical and slightly worn
- ❌ Heavy flat shadows that look like Material Design
- ❌ Generic emoji where icons should be
- ❌ Soft rounded corners on EVERYTHING — VHS boxes are sharp; stickers are slightly rotated rectangles
- ❌ Smooth gradient buttons — buttons should look stamped, printed, or embossed

---

## 3. Palette

```css
:root {
  /* Grounds — CRT-warm dark base */
  --ground:       #0a0807;  /* CRT off, warm-black, almost the void */
  --ground-2:     #15120f;  /* slightly lifted surface (cards) */
  --ground-3:     #211c17;  /* hover / elevated */

  /* Creams — yellowed paper, NOT white */
  --cream:        #f2ead6;  /* primary text on dark */
  --cream-dim:    #c8c0ad;  /* secondary text */
  --paper:        #e8dfc4;  /* receipts, labels */

  /* Punctuating accents — high saturation, used SPARINGLY */
  --magenta:      #ff2e6e;  /* genre stickers, primary CTA */
  --acid:         #d6ff3e;  /* "NEW!" labels, highlight bursts */
  --sodium:       #ff8a3d;  /* neon orange — warnings, attention */
  --phosphor:     #4afff0;  /* CRT cyan — secondary accents, focus rings */

  /* Functional */
  --error:        #ff4530;  /* tape red */
  --success:      #d6ff3e;  /* reuse acid */
}
```

**Usage rule**: ground+cream covers ~85% of the surface. Accents are **punctuation**, not decoration. One accent per region max — if a card has a magenta sticker, the CTA on that card is cream-on-ground, not magenta.

---

## 4. Typography

| Role | Font | Fallback | Notes |
|------|------|----------|-------|
| **Display** | Cooper Black | Recoleta | The Ghostbusters font. For movie titles, hero headers, h1. Always tight tracking. |
| **Sub-display / Kicker** | Druk Condensed Heavy | Tungsten / Bebas Neue | All-caps, condensed, brutal. For "NEW RELEASES", "STAFF PICKS" labels. |
| **Body** | Departure Mono | IBM Plex Mono | Adds receipt/cassette-label texture. Use for body, metadata, stats. |
| **Hand-script** | Permanent Marker | Caveat Brush | Sparingly — for "BE KIND REWIND" and decorative annotations. |

**Scale** (rem, root 16px):
- Display XL: 4.5rem / 1 / -0.02em
- Display L:  3rem / 1.05 / -0.02em
- Display M:  2rem / 1.1 / -0.01em
- Kicker:     0.875rem / 1 / 0.18em (uppercase, tracked)
- Body L:     1.0625rem / 1.55
- Body:       0.9375rem / 1.6
- Caption:    0.8125rem / 1.4 / 0.04em

**Critical rule**: never mix more than 2 fonts on a single component. Display + body. Or Display + kicker. Never all three.

---

## 5. Textures & Effects

These are **mandatory layers** that give the aesthetic its physicality. Apply as overlays/backgrounds, not as decorative widgets.

### Scanlines (always-on background)
```css
.scanlines::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    180deg,
    transparent 0,
    transparent 2px,
    rgba(0,0,0,0.18) 2px,
    rgba(0,0,0,0.18) 3px
  );
  z-index: 9999;
}
```

### CRT vignette (page-level)
```css
.crt::after {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 55%,
    rgba(0,0,0,0.55) 100%
  );
  z-index: 9998;
}
```

### Grain overlay (SVG noise, 3-5% opacity)
Generate noise SVG once, apply as background-image with `opacity: 0.04`. Adds analog grit.

### Chromatic aberration (interactive hover)
On hover of buttons/links:
```css
.aberrate:hover {
  text-shadow:
    -1px 0 0 var(--magenta),
     1px 0 0 var(--phosphor);
}
```

### Phosphor glow (accent elements)
```css
.glow-magenta { box-shadow: 0 0 24px rgba(255, 46, 110, 0.4), 0 0 8px rgba(255, 46, 110, 0.6); }
.glow-acid    { box-shadow: 0 0 24px rgba(214, 255, 62, 0.4), 0 0 8px rgba(214, 255, 62, 0.6); }
```

### Tracking-error glitch (page/section transitions)
Random horizontal slice gets offset 2-6px for ~200ms. Implement via CSS keyframes or JS one-shot effect. Used on route changes, modal open, library item add/remove.

---

## 6. Motion Language

Three guiding principles:

1. **Mechanical, not organic** — easings closer to `cubic-bezier(0.3, 0, 0.7, 1)` (snappy, slightly abrupt). NO spring/bounce.
2. **Brief, then still** — durations 150-300ms. Long animations only for hero moments (page load CRT power-on).
3. **Inspired by physical hardware** — cassette eject, tracking dial, tape rewind, channel change.

| Trigger | Animation |
|---------|-----------|
| First page load | "CRT power-on": vignette opens from center over 800ms with phosphor bloom |
| Route change | Tracking-error glitch (200ms) → fade-in next page |
| Modal open | Tape-eject slide-up with slight rotation |
| Modal close | Reverse + brief static noise burst |
| Library add | "REC" red dot pulses briefly in corner |
| Library remove | "BE KIND, REWIND" toast (sodium orange, mono) |
| Hover on VHS card | Slight 2deg tilt + chromatic aberration on title |
| Background ambient | Scanline shimmer (very slow vertical drift, 8s loop) |

---

## 7. Component Patterns

### VHS Box Card (the signature component)
- Vertical orientation, 2:3 aspect ratio (mimics VHS box)
- Top bar: 28px tall, ground-2, contains: spine icon + truncated title in Druk Condensed
- Body: poster image, full-bleed, slight inset shadow
- Bottom bar: dot-matrix metadata (year • runtime • rating) in Departure Mono
- Genre sticker: absolute-positioned top-right, slight -4deg rotation, magenta/acid/sodium per genre
- Hover: 2deg tilt, chromatic aberration on title, sodium-glow on sticker

### Genre Sticker (chip)
- Inline rectangle, slight rotation (-4deg to +4deg, deterministic per genre name)
- Cream background, ground text, OR magenta background with cream text
- Druk Condensed, uppercase, 0.75rem
- Hard 4px offset shadow (no blur)

### Receipt (stats / metadata blocks)
- `paper` background, ground text
- Departure Mono only
- Dashed border-top and border-bottom, looks like perforated paper
- Numbers right-aligned, labels left-aligned
- Optional "barcode" SVG line at bottom

### Shelf Row (genre / category sections)
- Horizontal scroll, snap-to-card
- Kicker label above ("NEW RELEASES" in acid sodium underline)
- Maybe small Permanent Marker annotation: "★ staff pick"

### CRT Display Frame (search / featured)
- Thick rounded outer frame, ground-3
- Inner: ground with scanlines amplified
- Glowing phosphor border 1px

### Buttons
- **Primary**: magenta fill, **deep-ink (ground) text**, Druk Condensed uppercase, hard 3px offset shadow in ground, no border-radius (or 2px max), chromatic aberration on hover. Text is `--vhs-ground` on `--vhs-magenta` (≈ 5.58:1) to clear WCAG AA — cream-on-magenta was ~2.98:1 and failed (issue #45). The neon magenta token is unchanged; only the button's text color is dark.
- **Secondary**: cream outline 2px on ground, cream text in Departure Mono, no shadow
- **Ghost**: text only, magenta on hover with chromatic aberration

### Form Inputs
- Ground-2 background, cream text, 2px ground-3 border
- Focus: phosphor border + soft phosphor glow
- Label above in Druk Condensed uppercase kicker style

---

## 8. Memorable Moments (the differentiators)

These are the **non-negotiable** distinctive features. Every screen should preserve them where applicable.

1. **VHS box cards** — every movie/show/anime renders as a VHS box, never a generic card
2. **"BE KIND, REWIND" toast** — sodium orange, Permanent Marker, appears bottom-right when removing from library
3. **Detail page = unfolded VHS cover** — front cover (poster) + spine (title vertical) + back cover (synopsis + barcode + rating)
4. **CRT power-on** on first load — vignette opens with bloom, scanlines fade in
5. **Tracking-error glitch** on route transitions
6. **Library = video store shelves** — horizontal scroll, shelf labels, optional dust/wear texture on heavily-watched items

---

## 9. Technical Constraints

| Constraint | Detail |
|-----------|--------|
| **Framework** | Next.js 15 App Router (TypeScript) |
| **Styling** | Tailwind CSS — accept Tailwind classes in output. CSS vars via `@theme` directive in `globals.css` |
| **Components** | shadcn/ui already installed: button, input, select, skeleton, badge, card, dialog. Output should compose with these (override styling via classes / `className` prop) |
| **i18n** | Routes are `app/[lang]/...`. All copy must be variable-driven, not hardcoded. Use placeholder `{t('key')}` in outputs |
| **Theme** | Dark-first (the "CRT" is always on). Light mode is NOT a goal. |
| **Mobile** | Mobile-first responsive. Cards stack to single column on small. Shelves remain horizontal scroll. |
| **Accessibility** | WCAG 2.1 AA contrast on text. Focus rings always visible (phosphor). All interactive elements keyboard-navigable. ARIA labels for icon-only buttons. |
| **Performance** | No heavy WebGL. Use CSS for grain/scanlines/glow. Lazy-load posters. |

---

## 10. Prompt Template for Claude Design

Use this template for each screen. Copy + fill in the brackets.

```
# Screen: [name]

## Design system context
[paste this entire VHS spec document]

## What this screen is
- Role in flow: [e.g. "entry after login — user's library and activity overview"]
- Primary user goal: [e.g. "see at a glance what I've watched / what's new in my library"]
- Secondary actions: [e.g. "navigate to search, remove items, change view mode"]

## Functional requirements
- Data on screen: [list every piece of data the screen displays]
- Actions: [list every button / link / interaction]
- States: [empty, loading, error, populated with 1-3 items, populated with 50+ items]

## What the current screen looks like (anti-reference)
[attach screenshot]
What is broken / generic / not on-brand: [list specific issues]

## Constraints
- shadcn/ui components available: button, input, select, skeleton, badge, card, dialog
- Must be mobile-responsive
- Must compose with the VHS design system above
- Must preserve at least these memorable moments: [list which apply, e.g. "VHS box cards for media; receipt-style stats"]

## Ask
Design this screen with the VHS Rental aesthetic, fully committing to the direction. Show the empty state AND the populated state. Output:
1. The full HTML + Tailwind classes for the screen
2. CSS variables / globals.css additions if any new tokens are needed
3. Notes on which shadcn components were customized
4. The "memorable moment" you chose to anchor this screen
```

---

## 11. Implementation order (suggested)

Build the foundation layers first, then screens:

1. **Foundation**: globals.css with palette + scanlines + vignette + grain + font imports
2. **Primitives**: VHSBoxCard, GenreSticker, Receipt, CRTFrame components
3. **Layout**: shell with header (logo as faux Cooper Black logotype), main, bottom nav (mobile)
4. **Screens in priority order**:
   - Dashboard (most broken in current state)
   - Library (signature shelves layout)
   - Search + results
   - Detail (unfolded VHS cover — the show-stopper)
   - Settings + Avatar cropper
   - Auth (login/signup/forgot)

---

## Changelog

- 2026-05-26: Initial spec written. Direction chosen by project owner (personal project, full creative freedom).
