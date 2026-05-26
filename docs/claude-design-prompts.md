# Claude Design Prompts — MyReelMind

Each section below is a self-contained prompt to paste into Claude Design (or any UI generator). Every prompt **assumes you've already pasted [`docs/design-system-vhs.md`](./design-system-vhs.md) as project-level system design**. If you start a fresh session in a project where the spec is not loaded, paste the spec first, then the screen prompt.

**Workflow per screen:**
1. Open Claude Design in a fresh session within the project (where the spec is loaded)
2. Paste the screen prompt below
3. Attach the current screenshot when prompted
4. Iterate

---

## ⚡ Standing rules (apply to EVERY screen prompt below)

Add these as the closing paragraph of any prompt you paste, OR rely on Claude Design's project memory if it persists across chats:

> **Reuse the visual primitives validated in the Detail screen of this project:**
> - **Header**: chunky M-logo box + "MyReelMind · Video & Tape Rental · Est. 1985" Cooper Black logotype + acid-green "OPEN" sticker + nav links right + "SIGN IN" CTA. Border-bottom with phosphor cyan accent.
> - **Bottom remote-control tab bar**: 5 chunky color-coded buttons (HOME / BROWSE / RENT / LIBRARY / ACCOUNT), active state pressed-in with magenta fill, persistent across all screens including mobile.
> - **VHS box cards**: top-strip with title in colored bg, year + rental ID label, geometric tinted-SVG poster placeholder, diagonal "RENTAL" / "NEW ARRIVAL" / "STAFF PICK" sticker top-right, footer with year/rating/aspect/catalog-ID in mono.
> - **Genre stickers**: rotated -4deg/+4deg chips with hard offset shadows, color per genre (magenta/phosphor/acid/sodium/paper).
> - **Source badges**: stamped-label style "SOURCE: TMDB-149" with hard offset shadows, color per source.
> - **Receipts**: cream paper bg, monospace, dashed perforated borders, line-by-line label+value with dot leaders.
> - **Cream paper panels** (`--paper`): for long-form text (synopses, lists, instructions). Two-column layout where appropriate.
> - **MEMBERS ONLY pattern**: circular badge in sodium + headline with chromatic aberration + magenta-fill CTA + secondary outlined CTA + Permanent Marker annotation, for any state requiring authentication.
>
> Use the SAME palette tokens, font stack, and motion language from the spec. Do NOT reinvent components — extend, compose, or adapt the validated primitives. If a screen needs a new pattern not in the validated list, introduce it intentionally and explain why.

---

## Screen 01 — Dashboard / "Your Activity" (logged-in home)

### What this screen is
- **Role in flow**: First screen after login. Entry point that summarizes user's media tracking activity.
- **Primary user goal**: Get a quick pulse on personal tracking — what I've watched, what I haven't touched in a while, suggestions to act on.
- **Secondary actions**: Jump to search, jump to library, see recent additions.

### Functional requirements

**Data on screen** (logged-in user):
- Stat: total completed items (count)
- Stat: total hours watched (decimal, 1dp)
- Stat: items in progress (NEW — currently missing from screen)
- Stat: items "to watch" / wishlist (NEW)
- Recent activity feed: last 5-10 items the user marked as watched / added (with timestamps)
- "Pick up where you left off" row: in-progress items with progress bar
- "Recently added" row: items added this week

**Actions**:
- Click a stat → drills down to that filtered view in library
- Click a media item → goes to detail page
- Click "Find something to watch" CTA in empty state → goes to search

**States**:
- **Empty** (new user, current state): zero stats, no rows, empty-state with strong CTA
- **Light** (1-3 items): single row with all items shown
- **Populated** (50+ items): multiple horizontal-scroll rows, paginated activity feed

### Current screen (anti-reference)

**Attach screenshot of `/en/dashboard`**

What's broken / off-brand in the current render:
- Header bar is gray/white while body is black — theme inconsistent (broken dark mode)
- StatsCards: light-gray bg with even-lighter-gray labels — labels are nearly invisible, numbers barely contrast
- 3 empty placeholder cards with no labels — unclear what they represent (broken skeleton?)
- Empty state "No activity yet / Find something to watch" — dark blue text on light gray, low contrast, no call-to-action energy
- No logo top-left
- Profile icon top-right is tiny gray icon, barely visible
- Zero personality — looks like a generic admin dashboard
- Numbers (0, 0.0) feel sterile; this should feel like a video store member card

### Constraints

- shadcn/ui available: button, input, select, skeleton, badge, card, dialog
- Must be mobile-responsive (stats stack 2x2 then 1x4 on small)
- All copy via i18n keys — use `{t('dashboard.your_activity')}` style placeholders
- Dark-first (CRT always on)
- Preserve memorable moments from spec: **Receipt-style stats**, **VHS box cards** for media items, **shelf rows** for activity

### Ask

Redesign this screen fully committing to the VHS Rental 1985 aesthetic.

Anchor the design with the **dot-matrix receipt** as the stats container — the four stat numbers should look like they were just printed off a Blockbuster register, with dashed perforation borders and a small "barcode" line at the bottom. The receipt sits prominently like a member card.

Below the receipt, render activity rows as **video store shelves** with kicker labels (e.g. "RECENTLY WATCHED" in Druk Condensed acid-green, slight underline). VHS box cards on the shelf, horizontal scroll.

Empty state: instead of polite gray text, design a **"STORE CLOSED — RENT SOMETHING"** card with a magenta CTA button "BROWSE THE AISLES" pointing at search. Include a small Permanent Marker "★ first time? start with a classic" annotation.

Output:
1. Full HTML + Tailwind classes for the screen (both empty and populated states)
2. Any new CSS vars / globals.css additions
3. Notes on customized shadcn components
4. The "memorable moment" you anchored this screen on

---

## Screen 02 — Login (`/en/login`)

### What this screen is
- **Role in flow**: Unauthenticated entry. User taps "Login" from header → lands here.
- **Primary user goal**: Sign in fast (email/password) or via OAuth (Google, GitHub).
- **Secondary actions**: Sign up (if no account), recover password.

### Functional requirements

**Data on screen**:
- Email input (with label, validation)
- Password input (with label, validation, show/hide toggle)
- "Forgot password?" link
- "Sign in" primary CTA
- OAuth row: Google, GitHub
- "Create account" secondary link
- Error banner (when login fails)

**Actions**:
- Submit form → POST to auth endpoint
- Click forgot → `/forgot-password`
- Click create account → `/signup`
- Click OAuth provider → starts OAuth flow

**States**:
- Idle (form blank)
- Filled (form valid, button active)
- Loading (after submit, button shows spinner)
- Error (invalid credentials → error banner above form)

### Current screen (anti-reference)

**Attach screenshot of `/en/login`**

What's broken / off-brand:
- Header gray while body black (same broken theme as dashboard)
- "Sign in" title in white serif (default font, no character)
- Form fields dark with thin white border — lifeless
- "Sign in" button is dark gray on dark background — barely visible
- **i18n bug**: "Create account Create account" duplicated text (cleanup needed in code, NOT to be carried over)
- **i18n bug**: divider shows lonely "o" — Spanish string leaked into English page (cleanup needed in code, NOT to be carried over)
- OAuth buttons are flat gray gradient — generic
- Form is alone in viewport center — feels empty, no atmosphere
- Zero personality

### Constraints

- shadcn/ui available: button, input, select, skeleton, badge, card, dialog
- Mobile-responsive (single column on small, form max-width ~420px)
- All copy via i18n keys
- Dark-first
- Preserve memorable moments: **CRT display frame** for the form container

### Ask

Redesign the login form as a **video store membership signup desk**.

Wrap the form in a **CRT display frame** — thick rounded outer bezel in `--ground-3`, inner area with amplified scanlines and a phosphor-cyan glow border. Title at top should be **"BECOME A MEMBER"** (or "MEMBER SIGN-IN" for the login variant) in Cooper Black, slight chromatic-aberration shadow.

Form fields styled as **labeled cassette inputs**: kicker label in Druk Condensed uppercase above each input, input itself with `--ground-2` bg + 2px ground-3 border, focus state lights up phosphor-cyan with soft glow.

Primary CTA "SIGN IN" → magenta-fill button, Druk Condensed uppercase, cream text, hard 3px sodium offset shadow, chromatic aberration on hover.

OAuth buttons styled as **rental cards** — cream paper background, ground text, brand icon to the left, slight rotation (-1.5deg for Google, +1.5deg for GitHub), hard offset shadows.

Add atmospheric background: a barely-visible repeating pattern of VHS box silhouettes lined up like store shelves in the negative space to the left and right of the form, faded to ~6% opacity. Adds the store feeling without distracting.

Bottom: "Forgot password?" in cream-dim Departure Mono italic. "Create account" as a separate framed link below the OAuth row — "NEW HERE? GET A MEMBER CARD →" in Druk Condensed acid-green.

Output:
1. Full HTML + Tailwind classes (idle + loading + error states)
2. Any CSS additions
3. Notes on customized shadcn Input / Button
4. The memorable moment

---

## Screen 03 — Signup (`/en/signup`)

### What this screen is
- **Role in flow**: Unauthenticated new user → lands here from "Create account" link on login OR direct visit.
- **Primary user goal**: Create a new account with email/password OR via OAuth.
- **Secondary actions**: Go back to login, see privacy policy / terms.

### Functional requirements

**Data on screen**:
- Email input (label, validation)
- Password input (label, validation, strength indicator ideally)
- Confirm password input (label, validation that matches password)
- "Create account" primary CTA
- OAuth row: Google, GitHub
- "Sign in" link (for users who already have an account)
- Error banner (when signup fails — email already taken, weak password, etc.)
- (Future) Privacy policy / Terms checkbox

**Actions**:
- Submit → POST to signup endpoint
- Click sign in → `/login`
- Click OAuth provider → starts OAuth flow

**States**:
- Idle (all fields blank)
- Validating (live feedback on password strength, email format, confirm match)
- Submitting (button shows spinner)
- Error (banner above form: "Email already in use", etc.)
- Success (transient state before redirect to verification or dashboard)

### Current screen (anti-reference)

**Attach screenshot of `/en/signup`**

What's broken / off-brand:
- Same header gray vs body black theme issue
- "Create account" title in default white serif — no character
- Three identical form fields, dark with thin white border — lifeless, no hierarchy between password and confirm
- "Create account" button — almost invisible (dark on dark)
- **i18n bug**: "Sign in Sign in" duplicated (SAME bug as login's "Create account Create account" — confirms shared component issue, NOT to be carried into redesign)
- **i18n bug**: lonely "o" in OAuth divider (same as login)
- OAuth buttons flat gray gradient — generic
- No password strength feedback
- No visual differentiation between password and confirm password (both look identical, easy to mismatch)
- Empty atmosphere

### Constraints

- shadcn/ui available: button, input, select, skeleton, badge, card, dialog
- Mobile-responsive (single column on small, form max-width ~440px)
- All copy via i18n keys
- Dark-first
- Preserve memorable moments: **Membership application form** aesthetic (paper-card with form sections)

### Ask

Redesign the signup form as a **video store membership application card** — like the carbon-copy paper forms you'd fill out at Blockbuster to get your member card in 1985.

Wrap the form in a **paper-card container**: `--paper` (yellowed cream) background floating over the dark CRT room with hard offset shadow + slight rotation (-0.5deg, very subtle). The card has a perforated top edge (dashed border that looks like tear-off perforation).

Title at top: **"GET YOUR MEMBER CARD"** in Cooper Black, sodium-orange chromatic-aberration shadow. Below it, a Permanent Marker handwritten subtitle: "★ free for life — bring your own snacks".

Form fields are **stamped boxes on paper**:
- Each field has a Druk Condensed uppercase label
- Input: ground-2 bg, 2px ground border, mono font for input text
- Confirm password should have a small acid-green check icon when it matches the password (and turn magenta when it doesn't)
- Password should show a **dot-matrix strength meter** below (4 dots that fill in acid color as strength increases)

CTA: **"ISSUE MY CARD"** instead of generic "Create account" — magenta-fill, Druk Condensed uppercase, sodium offset shadow, chromatic aberration on hover.

Below the form, "ALREADY A MEMBER?" in Druk Condensed acid-green with link "→ SIGN IN HERE" (NOT the duplicated "Sign in Sign in" bug).

OAuth row: same rental-card-style buttons as login (cream paper, slight rotation, hard shadows, brand icons).

Background atmosphere: faint scanlines + VHS silhouettes (same as login), but the paper card is the focal point — should feel like a real physical object lifted off the counter.

Output:
1. Full HTML + Tailwind classes (idle, validating, submitting, error states)
2. CSS additions for paper texture and perforation
3. Notes on customized shadcn Input / Button
4. The memorable moment

---

## Screen 04 — Search (`/en/search`)

### What this screen is
- **Role in flow**: Main discovery surface. User navigates here from header "Search" link OR from dashboard CTA. Used both for finding new media to add AND for re-finding something you've watched.
- **Primary user goal**: Type a query, see ranked results across movies / TV shows / anime, click an item to see detail.
- **Secondary actions**: Filter by type, see recent searches, browse popular / trending without typing.

### Functional requirements

**Data on screen**:
- Search input (with placeholder, debounce ~300ms, clearable)
- Filter pills: All / Movies / TV Shows / Anime (radio, only one active)
- Result grid (when query has 1+ chars and results exist)
- Recent searches (when input is empty and user has history)
- Popular / trending (when input is empty and no history)

**Actions**:
- Type → triggers search after debounce
- Click filter → narrows result type
- Click result card → navigates to detail
- Clear input → returns to "browse" state

**States**:
- **Initial** (input empty, no query yet) — currently shows "No results found" which is WRONG. Should show trending / popular shelves to invite exploration
- **Typing** (query 1-2 chars, before debounce fires) — input shows loading spinner inside the field
- **Loaded with results** — grid of VHS box cards
- **Loaded with zero results** (query but no matches) — empty state with suggestions
- **Error** (API failure) — banner above grid

### Current screen (anti-reference)

**Attach BOTH screenshots when prompting**:
1. `/en/search` (initial state, no query)
2. `/en/search?q=alien` (loaded state with real TMDB results)

What's broken / off-brand in the **initial state**:
- Same header gray vs body black
- "Search" title in default serif
- Filter pills (All / Movies / TV Shows / Anime) all look identical — **no visual indication which is active**. Probably all are unselected but "All" should be active by default.
- Empty state shows "No results found / Try adjusting your search or filters" **before any search was done** — this is a state-handling bug. Should show trending/popular when input is empty.
- Search bar is plain dark rectangle with thin white border, no character
- No visual hierarchy, generic admin-panel search

What's broken / off-brand in the **loaded state** (with results):
- Result cards are generic rectangles with rounded corners — NOT VHS boxes
- Each card shows only: poster image + year (bottom on light gray footer) + "TMDB" badge top-left
- **No title overlay** on cards — user can't tell what the movie is called without clicking
- **No genre sticker** — every movie looks the same regardless of genre
- **No rating / popularity** indication
- "TMDB" badge looks like a generic database label, not a source sticker with character. Could be styled as a "RENTAL ID" tag or genre sticker
- Light gray footer with year on a dark card creates jarring inconsistency
- Filter pills still don't indicate active state in loaded view either
- Grid spacing is fine but cards lack visual hierarchy — bigger / featured items would help
- No "found X results for Y" header — user has no confirmation that search ran successfully

### Constraints

- shadcn/ui available: button, input, select, skeleton, badge, card, dialog
- Mobile-responsive (filter pills wrap; result grid 2-col on small, 4-6-col on large)
- All copy via i18n keys
- Dark-first
- Preserve memorable moments: **CRT display** for the search input, **filter pills as channel selector**, **VHS box cards** for results, **shelves** for trending/popular browse state

### Ask

Redesign search as the **store directory terminal** — a CRT computer terminal mounted at the entrance of the video store where customers look up movies.

**The search input is a CRT display**: rounded outer bezel (`--ground-3`, thick 8px), inner phosphor-cyan glow border, scanlines visible inside the input area. Placeholder text in Departure Mono cream-dim: "ENTER TITLE OR GENRE_" (with a blinking cursor effect on the underscore).

**Filter pills as channel selector buttons**: 4 chunky buttons styled like old TV channel buttons / cassette deck buttons — rectangular with hard shadows, mechanical feel. Active state pressed-in (inset shadow, magenta phosphor glow underneath). Labels in Druk Condensed: "ALL CHANNELS", "MOVIES", "TV", "ANIME". Active state is clearly distinct — magenta bg with cream text, pressed-in visual effect.

**Initial state** (empty input — replacing the buggy "No results"): show two shelves:
1. **"NOW SHOWING — POPULAR THIS WEEK"** (kicker in acid-green, underline)
2. **"STAFF PICKS"** (kicker in sodium-orange, with Permanent Marker "★ video store classics" annotation)
Both shelves are horizontal-scroll rows of VHS box cards (use placeholders if no real data yet).

**Loaded results**: tight grid of VHS box cards. Above the grid, a receipt-style header: "FOUND 47 RESULTS FOR 'ALIEN'" in Departure Mono cream, with a small dashed border below like a receipt rip.

**Zero results state** (genuinely no matches): not "Try adjusting your search". Instead: a card styled like a "OUT OF STOCK — CHECK AGAIN LATER" sticker stuck on a black box silhouette. Magenta sticker rotation, hard shadow, Druk Condensed uppercase. Below it: small Departure Mono suggestion "OR TRY: [genre], [decade], [actor]".

**Loading state**: between debounce + fetch, show 12 VHS-box-shaped skeletons with a subtle "tape rolling" shimmer (left-to-right gradient sweep).

Output:
1. Full HTML + Tailwind classes for ALL states (initial, typing, loaded with results, zero results, error)
2. CSS additions (CRT input, channel pill buttons, tape-rolling skeleton)
3. Notes on customized shadcn Input + Button
4. The memorable moment (recommended anchor: the CRT terminal feeling)

---

## Screen 05 — Media Detail (`/en/media/[id]`)

### What this screen is
- **Role in flow**: User clicks a result card in search OR an item in library → lands here. The "show me everything about this title" surface.
- **Primary user goal**: Decide whether to add to library / mark as watched. Read synopsis, see backdrop, glance at metadata.
- **Secondary actions**: See cast, see related items, mark as watched / wishlist / in-progress, write a personal note.

### Functional requirements

**Data on screen** (TMDB / AniList sourced):
- Backdrop image (wide hero, 16:9, contains the most cinematic shot)
- Poster image (2:3, the iconic box art)
- Title (and original title if different)
- Year, runtime, rating (TMDB / IMDb / AniList score)
- Genres (multiple chips)
- Synopsis / overview (paragraph)
- Cast (top 5-8 with role)
- Director / creator
- Source badge (TMDB / AniList)
- Type badge (Movie / TV Show / Anime)
- "Add to Library" action panel (or "Already in library" status if added)
- (Future) User personal rating + note
- (Future) Related items shelf

**Actions**:
- Click "Add to Library" → adds, panel transitions to "In library — set status" with options (Watched / Watching / Wishlist / Dropped)
- Click cast member → goes to filmography (not implemented yet, but design for it)
- If unauthenticated: panel shows "Sign in to add to library" with sign-in CTA

**States**:
- Anonymous (current capture) — synopsis visible, action panel says "Sign in"
- Authenticated, not in library — "Add to Library" CTA active
- Authenticated, in library — status selector visible, current status indicated
- Loading — skeleton for backdrop + poster + text
- Error — fallback message

### Current screen (anti-reference)

**Attach screenshot of `/en/media/tmdb-348`** (Alien 1979)

What's broken / off-brand:
- Same header gray vs body black (broken theme inherited)
- "Alien" title in default white serif overlaid on backdrop — generic, no impact
- **Blue "Sign in" button is a critical eyesore** — bright Tailwind blue-500 inside a dark page, completely off-theme. Looks like an unstyled default
- "Add to Library" panel is a generic bordered box, looks like a Bootstrap card
- Synopsis text is muted gray on dark — readable but lifeless, no editorial weight
- Tiny "TMDB" + "Movie" chips at bottom — easy to miss, no character
- Missing entirely: year displayed prominently, genres as actionable chips, runtime, rating, director, cast
- Two-column layout (poster left, synopsis right) is functional but predictable — feels like a Wikipedia infobox
- Backdrop is GREAT raw material (huge cinematic shot) but it's wasted — just sits there, no overlay treatment, no text weaving with it, no edge bleed

### Constraints

- shadcn/ui available: button, input, select, skeleton, badge, card, dialog
- Mobile-responsive (single column on small, two-column unfold on large)
- All copy via i18n keys
- Dark-first
- Preserve memorable moments: **Detail = unfolded VHS cover** (this is THE showcase screen for the redesign)

### Ask

This is the **flagship screen** of the redesign. Go bigger here than anywhere else.

Render the detail page as an **unfolded VHS cover sitting on the dark CRT room floor** — front cover, spine, back cover all visible in a single composition like someone took the VHS box apart and laid it flat.

**Composition (desktop)**:
- **TOP — the BACKDROP as cinematic poster art** (full-bleed top section, ~50vh tall). Treat the backdrop as the front of the box. Title overlay BOTTOM-LEFT in Cooper Black, MASSIVE (8-10rem), with strong magenta chromatic-aberration shadow (left/right RGB split offset 2-3px). Sub-title (original title if different) directly below in Druk Condensed cream. Year in sodium orange Departure Mono next to it. Backdrop fades to ground at bottom edge (gradient).

- **CENTER — three-panel VHS unfold**:
  - **LEFT panel = SPINE**: vertical strip, ~120px wide, `--ground-2` background, contains title written vertically in Cooper Black (rotated 90deg) + small "ALIEN 348" rental ID barcode-style at the bottom. Tape edge: dashed border on left side.
  - **MIDDLE panel = FRONT COVER**: the poster, generous size (max-w-md), framed in a thick 6px ground-3 border with hard sodium-orange offset shadow. Slight 1deg rotation. Genre stickers placed top-right of the poster (3-4 stickers at varying angles, with hard offset shadows — magenta, acid, sodium per genre).
  - **RIGHT panel = BACK COVER**: synopsis in Departure Mono cream on `--paper` (yellowed) background, presented as if it's the back-of-box blurb. Dashed border around it like a perforated panel. Above the synopsis: "SYNOPSIS" kicker in Druk Condensed acid-green underline. Below the synopsis: a **dot-matrix receipt** with metadata (RUNTIME • RATING • GENRE • DIRECTOR • YEAR), each line preceded by a dot character, monospace.

- **BELOW THE UNFOLD — action bar**:
  - When **anonymous**: a clear sticker label "MEMBERS ONLY" in Druk Condensed magenta, with "→ SIGN IN TO RENT THIS" CTA button (magenta fill, Druk Condensed, hard sodium offset shadow, chromatic aberration on hover). REPLACE the current jarring blue button entirely.
  - When **authenticated, not in library**: chunky "ADD TO MY LIBRARY" CTA in magenta fill, Druk Condensed uppercase. Hard offset shadow.
  - When **authenticated, in library**: cassette-deck-style segmented status selector — 4 chunky pressed/unpressed buttons: "WATCHED" / "WATCHING" / "WISHLIST" / "DROPPED". Current status shows pressed-in (inset shadow + magenta glow underneath).

- **BELOW ACTION BAR — cast row**:
  - Kicker label: "STARRING" in Druk Condensed acid-green underline
  - Horizontal scroll of small cast cards (avatar + name + role) — each card styled as a mini polaroid with hand-written role in Permanent Marker

- **BOTTOM — related items shelf** (if data available, otherwise placeholder):
  - "ALSO IN STOCK FROM THE SAME AISLE" kicker
  - Horizontal scroll of VHS box cards (related movies, sequels, same genre)

**Atmosphere**:
- Scanlines + grain over the whole page
- Backdrop has a subtle CRT-style horizontal scan-roll animation (very slow, 12s loop, just a barely-visible bright line drifting down)
- Slight chromatic aberration on hovering any interactive element
- Optional: a small Permanent Marker hand-written sticker overlaid on the poster — "★ HEY MARK: RUTH LOVED THIS ONE" — to evoke the staff-pick / handwritten-recommendation feel of a real video store

**Mobile**:
- Backdrop full-width, scaled appropriately
- Three VHS panels stack vertically (front → back → spine, in that priority)
- Cast row stays horizontal scroll
- Action bar sticky at bottom on small screens

Output:
1. Full HTML + Tailwind classes for ALL states (anonymous, auth+not-in-library, auth+in-library, loading)
2. CSS additions (chromatic aberration on title, scan-roll backdrop animation, polaroid cast cards)
3. Notes on customized shadcn Button / Badge
4. The memorable moment (recommended anchor: the three-panel VHS unfold composition)

---

## Bugs noted during audit (track in code, NOT in redesign)

These are real code-level bugs spotted during screen capture. They need to be fixed in the codebase regardless of the redesign:

- [ ] **Login + Signup**: "Create account Create account" / "Sign in Sign in" duplicated — same shared component bug on both pages. Investigate i18n key duplication or button label render bug
- [ ] **Login + Signup**: Standalone "o" in OAuth divider — Spanish i18n string leaked into English locale (same issue on both screens)
- [ ] **Search**: Empty state shows "No results found" before any query is entered. Should distinguish initial state (browse trending) from zero-results state (after a real query returned 0)
- [ ] **Search**: Filter pills (All/Movies/TV Shows/Anime) don't visually indicate which one is active
- [ ] **Search**: URL-based search (`/en/search?q=alien`) does not hydrate from query string — user must retype in input. Probably state initialization only reads from input event, not from URL params on mount
- [ ] **Result cards**: Missing title overlay — only poster + year + TMDB badge visible, user can't tell what each item is without clicking
- [x] **Detail page**: Runtime error querying `media_items` table — RESOLVED 2026-05-26 via `npx -y dotenv-cli -e .env.local -- npx drizzle-kit push`
- [ ] **Detail page**: "Sign in" button in `/en/media/[id]` action panel is bright Tailwind blue-500 — completely off-theme. Either inheriting default Button variant or hardcoded blue class. Find component and remove blue styling so it picks up project tokens.

---

## To be added when blockers are resolved

**Blocked by OAuth signup** (Google OAuth flow is broken):
- Screen 06 — Library (`/en/library`)
- Screen 07 — Settings (`/en/settings`)
- Screen 08 — Avatar Cropper modal (triggered from settings)

Once OAuth signup works, capture and we add the corresponding prompts.
