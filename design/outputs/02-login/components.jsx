// components.jsx — VHS primitives
// VHSBoxCard, GenreSticker, Receipt, BarcodePattern, PosterPlaceholder, TabBar

// ─────────────────────────────────────────────────────────────────────────────
// Tiny i18n shim — fakes the {t('namespace.key')} pattern.
// Real app would use next-intl etc. Here it's a flat lookup.
// ─────────────────────────────────────────────────────────────────────────────

const I18N = {
  "detail.kicker.browse": "Browse",
  "detail.kicker.anime": "Anime",
  "detail.kicker.title": "Akira",

  "detail.title": "Akira",
  "detail.original": "アキラ",
  "detail.tagline": "Neo-Tokyo is about to E.X.P.L.O.D.E.",
  "detail.year": "1988",
  "detail.runtime": "124 min",
  "detail.country": "Japan",
  "detail.lang": "Japanese · English Dub",
  "detail.rating": "R",
  "detail.format": "VHS · NTSC · HiFi Stereo",

  "detail.studio": "Tokyo Movie Shinsha",
  "detail.director": "Katsuhiro Otomo",
  "detail.basedon": "Based on the manga by Katsuhiro Otomo",
  "detail.source.tmdb": "SOURCE: TMDB-149",
  "detail.source.anilist": "SOURCE: ANI-30",
  "detail.source.imdb": "SOURCE: IMDb-tt0094625",

  "detail.synopsis.head": "Back Cover",
  "detail.synopsis.body":
    "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a psychic psychopath who can only be stopped by Kaneda and a group of psychics.",
  "detail.synopsis.body2":
    "Set in 2019, three decades after a mysterious explosion levelled Tokyo, the new city built on its ruins is a sprawl of corrupt politics, biker gangs and government black-ops. When Tetsuo Shima is captured following a highway crash, his latent telekinetic power awakens with apocalyptic force.",

  "detail.specs.head": "Tape Specifications",
  "detail.specs.cat":   "CATALOG NO.",
  "detail.specs.cat_v": "MRM-04421-A",
  "detail.specs.run":   "RUNTIME",
  "detail.specs.run_v": "00:02:04:18",
  "detail.specs.tape":  "TAPE LENGTH",
  "detail.specs.tape_v":"E-180 / SP",
  "detail.specs.audio": "AUDIO",
  "detail.specs.audio_v":"Dolby Stereo Hi-Fi",
  "detail.specs.color": "COLOR",
  "detail.specs.color_v":"Color · 1.85:1",
  "detail.specs.upc":   "UPC",
  "detail.specs.upc_v": "0 11891 04421 3",

  "detail.cast.head": "Featuring",
  "detail.cast.1": "Mitsuo Iwata",
  "detail.cast.2": "Nozomu Sasaki",
  "detail.cast.3": "Mami Koyama",
  "detail.cast.4": "Tesshō Genda",
  "detail.cast.5": "Hiroshi Ōtake",

  "detail.warning.head": "FBI Warning",
  "detail.warning.body":
    "Federal law provides severe civil and criminal penalties for the unauthorized reproduction, distribution or exhibition of copyrighted motion pictures (Title 17, United States Code, Sections 501 and 506). The Federal Bureau of Investigation investigates allegations of criminal copyright infringement.",

  "detail.cta.kicker": "Members Only",
  "detail.cta.head":   "Sign in to rent this tape",
  "detail.cta.body":   "MyReelMind keeps a record of what you've watched, what you own, and what you're chasing. Members can rent this title, queue it, or add it to a shelf.",
  "detail.cta.primary": "Sign in",
  "detail.cta.secondary": "Get a membership card",
  "detail.cta.tertiary": "Or, keep browsing — guests can read everything but the back room.",

  "detail.related.head": "Staff Picks — Same Aisle",
  "detail.related.note": "★ staff pick",
  "detail.related.action": "See full shelf",

  "detail.stickers.anime": "Anime",
  "detail.stickers.cyberpunk": "Cyberpunk",
  "detail.stickers.classic": "85-90 Classic",
  "detail.stickers.import": "Import",
  "detail.stickers.dubbed": "English Dub",
  "detail.stickers.new": "New Arrival",
  "detail.stickers.staff": "Staff Pick",

  "tab.home": "Home",
  "tab.browse": "Browse",
  "tab.rent": "Rent",
  "tab.library": "Library",
  "tab.account": "Account",

  "shell.brand": "MyReelMind",
  "shell.brand.sub": "Video & Tape Rental · Est. 1985",
  "shell.brand.open": "Open · 10am – 12am · All Week",
  "shell.guest": "Guest",
  "shell.signin": "Sign in",
  "shell.aisle": "Aisle 04 · Anime / Sci-Fi",

  "related.1.title": "Blade Runner",
  "related.1.year": "1982",
  "related.2.title": "Ghost in the Shell",
  "related.2.year": "1995",
  "related.3.title": "Vampire Hunter D",
  "related.3.year": "1985",
  "related.4.title": "RoboCop",
  "related.4.year": "1987",
  "related.5.title": "The Thing",
  "related.5.year": "1982",
  "related.6.title": "Ninja Scroll",
  "related.6.year": "1993",

  // ── Dashboard ──────────────────────────────────────────────
  "dashboard.kicker": "Member Home",
  "dashboard.your_activity": "Your Activity",
  "dashboard.greeting": "Evening, member",
  "dashboard.membercard.head": "MYREELMIND MEMBER CARD",
  "dashboard.membercard.store": "STORE #0485 · AISLE-ANYTIME",
  "dashboard.membercard.name": "MEMBER",
  "dashboard.membercard.name_v": "R. DECKARD",
  "dashboard.membercard.since": "MEMBER SINCE",
  "dashboard.membercard.since_v": "MAR 1985",
  "dashboard.membercard.no": "CARD NO.",
  "dashboard.membercard.no_v": "0485-22-1019",
  "dashboard.receipt.head": "— TONIGHT'S TALLY —",
  "dashboard.receipt.date": "TUE 06/01/26 · 21:47",
  "dashboard.stat.completed": "Completed",
  "dashboard.stat.hours": "Hours watched",
  "dashboard.stat.progress": "In progress",
  "dashboard.stat.towatch": "To-watch list",
  "dashboard.receipt.subtotal": "SUBTOTAL — TAPES LOGGED",
  "dashboard.receipt.thanks": "THANK YOU · BE KIND, REWIND",
  "dashboard.receipt.drill": "tap any line to browse →",

  "dashboard.row.resume": "Pick up where you left off",
  "dashboard.row.watched": "Recently watched",
  "dashboard.row.added": "Added this week",
  "dashboard.row.feed": "Register tape — activity log",
  "dashboard.row.seeall": "See all",

  "dashboard.feed.watched": "WATCHED",
  "dashboard.feed.added": "ADDED",
  "dashboard.feed.rated": "RATED",
  "dashboard.feed.progress": "RESUMED",

  "dashboard.empty.kicker": "Store Closed",
  "dashboard.empty.head": "Rent something",
  "dashboard.empty.body": "Your shelf is empty and the register's quiet. Walk the aisles and log your first tape — every classic counts.",
  "dashboard.empty.cta": "Browse the aisles",
  "dashboard.empty.cta2": "Import from a list",
  "dashboard.empty.note": "★ first time? start with a classic",

  "dashboard.resume.1.title": "Brazil",
  "dashboard.resume.1.year": "1985",
  "dashboard.resume.2.title": "Tron",
  "dashboard.resume.2.year": "1982",
  "dashboard.resume.3.title": "Paprika",
  "dashboard.resume.3.year": "2006",
  "dashboard.added.1.title": "Videodrome",
  "dashboard.added.1.year": "1983",
  "dashboard.added.2.title": "Perfect Blue",
  "dashboard.added.2.year": "1997",
  "dashboard.added.3.title": "Escape From N.Y.",
  "dashboard.added.3.year": "1981",
  "dashboard.added.4.title": "Wicked City",
  "dashboard.added.4.year": "1987",

  // ── Login / membership desk ────────────────────────────────
  "login.kicker": "Membership Desk",
  "login.title": "Member sign-in",
  "login.subtitle": "Insert card to continue",
  "login.label.email": "Member email",
  "login.label.password": "Pass code",
  "login.ph.email": "you@videostore.com",
  "login.ph.password": "••••••••",
  "login.show": "SHOW",
  "login.hide": "HIDE",
  "login.forgot": "Forgot your pass code?",
  "login.cta": "Sign in",
  "login.cta.loading": "Reading tape…",
  "login.divider": "or sign in with",
  "login.oauth.google": "Continue with Google",
  "login.oauth.github": "Continue with GitHub",
  "login.signup": "New here? Get a member card",
  "login.error.head": "TRACKING ERROR",
  "login.error.body": "That email or pass code didn't scan. Check the card and try again.",
  "login.legal": "By signing in you agree to rewind every tape. Late fees apply.",
  "login.terminal": "TERMINAL 04 · SIGN-IN · NTSC"
};

const t = (key) => I18N[key] ?? `{${key}}`;

// ─────────────────────────────────────────────────────────────────────────────
// PosterPlaceholder — tinted SVG with title text + abstract block art
// Inspired by the literal "top label band" of a VHS box cover
// ─────────────────────────────────────────────────────────────────────────────

function PosterPlaceholder({ title, subtitle, hue = "magenta", motif = "circle", catalog = "MRM-00000" }) {
  const palette = {
    magenta:  { bg: "#3a0d1a", band: "#ff2e6e", text: "#f2ead6", accent: "#4afff0", stripe: "#ff4530" },
    acid:     { bg: "#1c2207", band: "#d6ff3e", text: "#0a0807", accent: "#ff2e6e", stripe: "#4afff0" },
    sodium:   { bg: "#2a160a", band: "#ff8a3d", text: "#0a0807", accent: "#4afff0", stripe: "#f2ead6" },
    phosphor: { bg: "#062421", band: "#4afff0", text: "#0a0807", accent: "#ff2e6e", stripe: "#d6ff3e" },
    cream:    { bg: "#15120f", band: "#e8dfc4", text: "#0a0807", accent: "#ff2e6e", stripe: "#ff8a3d" },
  };
  const p = palette[hue] ?? palette.magenta;

  return (
    <div className="poster" style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '2 / 3',
      background: p.bg,
      overflow: 'hidden',
      border: '2px solid var(--ground)',
      boxShadow: 'inset 0 0 60px rgba(0,0,0,0.6)',
    }}>
      {/* Top label band — the iconic "VHS box top" */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        background: p.band,
        padding: '8px 10px 6px',
        borderBottom: '2px solid var(--ground)',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{
          fontFamily: 'var(--f-kicker)',
          color: p.text,
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}>{subtitle}</span>
        <span style={{
          fontFamily: 'var(--f-mono)',
          color: p.text,
          fontSize: '0.55rem',
          letterSpacing: '0.05em',
          opacity: 0.7,
        }}>{catalog}</span>
      </div>

      {/* Abstract art motif */}
      <svg viewBox="0 0 200 300" preserveAspectRatio="none"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* faint diagonal scan stripes */}
        <defs>
          <pattern id={`stripe-${hue}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={p.stripe} strokeWidth="0.5" opacity="0.18"/>
          </pattern>
        </defs>
        <rect x="0" y="32" width="200" height="268" fill={`url(#stripe-${hue})`}/>
        {motif === 'circle' && (
          <>
            <circle cx="100" cy="160" r="68" fill="none" stroke={p.band} strokeWidth="2" opacity="0.7"/>
            <circle cx="100" cy="160" r="48" fill={p.accent} opacity="0.5"/>
            <circle cx="100" cy="160" r="28" fill={p.band}/>
            <rect x="20" y="232" width="160" height="2" fill={p.accent}/>
          </>
        )}
        {motif === 'grid' && (
          <>
            <g stroke={p.band} strokeWidth="1" opacity="0.6" fill="none">
              {Array.from({length: 8}).map((_, i) =>
                <line key={i} x1="0" y1={70 + i*22} x2="200" y2={50 + i*22}/>
              )}
              {Array.from({length: 6}).map((_, i) =>
                <line key={`v${i}`} x1={20 + i*32} y1="60" x2={10 + i*32} y2="240"/>
              )}
            </g>
            <rect x="60" y="120" width="80" height="60" fill={p.accent} opacity="0.85"/>
          </>
        )}
        {motif === 'triangle' && (
          <>
            <polygon points="100,80 160,220 40,220" fill={p.band} opacity="0.85"/>
            <polygon points="100,120 140,210 60,210" fill={p.accent} opacity="0.7"/>
            <rect x="0" y="230" width="200" height="4" fill={p.band}/>
            <rect x="0" y="238" width="200" height="2" fill={p.accent}/>
          </>
        )}
        {motif === 'silhouette' && (
          <>
            <rect x="50" y="90" width="100" height="130" fill={p.band} opacity="0.4"/>
            <polygon points="60,220 100,90 140,220" fill={p.accent}/>
            <circle cx="100" cy="120" r="14" fill={p.band}/>
          </>
        )}
        {motif === 'bars' && (
          <>
            {[0,1,2,3,4,5,6].map(i => (
              <rect key={i} x={20 + i*24} y={90 + Math.abs(3-i)*12} width="16" height={140 - Math.abs(3-i)*12} fill={p.band} opacity={0.45 + i*0.07}/>
            ))}
          </>
        )}
        {motif === 'spool' && (
          <>
            {/* Cassette shell outline */}
            <rect x="30" y="100" width="140" height="92" fill="none" stroke={p.band} strokeWidth="2" opacity="0.85"/>
            {/* Window cutout */}
            <rect x="44" y="120" width="112" height="52" fill={p.accent} opacity="0.2" stroke={p.band} strokeWidth="1"/>
            {/* Tape strip between reels */}
            <rect x="60" y="142" width="80" height="8" fill={p.band} opacity="0.55"/>
            {/* Left reel — concentric */}
            <g>
              <circle cx="74" cy="146" r="22" fill="none" stroke={p.band} strokeWidth="2"/>
              <circle cx="74" cy="146" r="15" fill="none" stroke={p.band} strokeWidth="1.2" opacity="0.75"/>
              <circle cx="74" cy="146" r="9" fill={p.accent}/>
              <circle cx="74" cy="146" r="3" fill={p.band}/>
              {/* spokes */}
              {[0,1,2,3,4,5].map(i => (
                <line key={i}
                  x1={74 + Math.cos(i*Math.PI/3)*9}  y1={146 + Math.sin(i*Math.PI/3)*9}
                  x2={74 + Math.cos(i*Math.PI/3)*22} y2={146 + Math.sin(i*Math.PI/3)*22}
                  stroke={p.band} strokeWidth="1.2" opacity="0.8"/>
              ))}
            </g>
            {/* Right reel — concentric */}
            <g>
              <circle cx="126" cy="146" r="22" fill="none" stroke={p.band} strokeWidth="2"/>
              <circle cx="126" cy="146" r="15" fill="none" stroke={p.band} strokeWidth="1.2" opacity="0.75"/>
              <circle cx="126" cy="146" r="9" fill={p.accent}/>
              <circle cx="126" cy="146" r="3" fill={p.band}/>
              {[0,1,2,3,4,5].map(i => (
                <line key={`r${i}`}
                  x1={126 + Math.cos(i*Math.PI/3 + 0.4)*9}  y1={146 + Math.sin(i*Math.PI/3 + 0.4)*9}
                  x2={126 + Math.cos(i*Math.PI/3 + 0.4)*22} y2={146 + Math.sin(i*Math.PI/3 + 0.4)*22}
                  stroke={p.band} strokeWidth="1.2" opacity="0.8"/>
              ))}
            </g>
            {/* Sprocket holes top */}
            <g fill={p.band} opacity="0.7">
              {[0,1,2,3,4,5].map(i => (
                <rect key={i} x={48 + i*18} y="108" width="6" height="4"/>
              ))}
            </g>
            {/* Bottom label strip */}
            <rect x="44" y="178" width="112" height="6" fill={p.band} opacity="0.6"/>
          </>
        )}
        {motif === 'mesh' && (
          <>
            {/* Wireframe triangulated polyhedron — deterministic from a small mesh */}
            <g stroke={p.band} strokeWidth="1.2" fill="none" opacity="0.95">
              {/* Vertices: */}
              {/* a(100,80) b(40,140) c(160,140) d(60,210) e(140,210) f(100,160) g(100,250) */}
              {/* faces */}
              <polygon points="100,80 40,140 100,160" fill={p.accent} opacity="0.4"/>
              <polygon points="100,80 160,140 100,160" fill={p.band} opacity="0.18"/>
              <polygon points="40,140 60,210 100,160" fill={p.band} opacity="0.25"/>
              <polygon points="160,140 140,210 100,160" fill={p.accent} opacity="0.28"/>
              <polygon points="60,210 100,250 100,160" fill={p.band} opacity="0.32"/>
              <polygon points="140,210 100,250 100,160" fill={p.accent} opacity="0.22"/>
              {/* edges */}
              <polyline points="100,80 40,140 60,210 100,250 140,210 160,140 100,80"/>
              <line x1="100" y1="80"  x2="100" y2="160"/>
              <line x1="40"  y1="140" x2="100" y2="160"/>
              <line x1="160" y1="140" x2="100" y2="160"/>
              <line x1="60"  y1="210" x2="100" y2="160"/>
              <line x1="140" y1="210" x2="100" y2="160"/>
              <line x1="100" y1="250" x2="100" y2="160"/>
            </g>
            {/* vertex dots */}
            <g fill={p.band}>
              {[[100,80],[40,140],[160,140],[60,210],[140,210],[100,160],[100,250]].map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r="2.5"/>
              ))}
            </g>
            {/* corner tick mark */}
            <g stroke={p.accent} strokeWidth="1" opacity="0.6">
              <line x1="14" y1="68" x2="26" y2="68"/>
              <line x1="20" y1="62" x2="20" y2="74"/>
            </g>
          </>
        )}
      </svg>

      {/* Title plate */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 65%, transparent)',
        padding: '24px 12px 10px',
      }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          color: 'var(--cream)',
          fontSize: '1.5rem',
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          textShadow: `2px 2px 0 ${p.band}, 3px 3px 0 var(--ground)`,
        }}>{title}</div>
      </div>

      {/* Worn-corner tape strip */}
      <div style={{
        position: 'absolute', top: 38, right: -18,
        background: p.accent, color: 'var(--ground)',
        padding: '3px 22px',
        fontFamily: 'var(--f-kicker)',
        fontSize: '0.6rem',
        letterSpacing: '0.18em',
        transform: 'rotate(35deg)',
        border: '1px solid var(--ground)',
      }}>RENTAL</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VHSBoxCard — the signature small card
// ─────────────────────────────────────────────────────────────────────────────

function VHSBoxCard({ title, year, hue = "magenta", motif = "circle", catalog, badge, badgeColor = "acid", progress = null, meta = null }) {
  return (
    <div className="vhs-card" style={{
      width: '100%',
      background: 'var(--ground-2)',
      border: '2px solid var(--ground)',
      boxShadow: '5px 5px 0 rgba(0,0,0,0.8)',
      transition: 'transform 110ms cubic-bezier(0.3, 0, 0.7, 1)',
      position: 'relative',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(-2deg) translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0) translateY(0)'}
    >
      {/* spine bar */}
      <div style={{
        height: 28, padding: '0 10px',
        background: 'var(--ground-3)',
        borderBottom: '2px solid var(--ground)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 4, height: 16, background: 'var(--magenta)', display: 'inline-block',
        }} />
        <span style={{
          fontFamily: 'var(--f-kicker)',
          color: 'var(--cream)',
          fontSize: '0.78rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</span>
      </div>

      <PosterPlaceholder title={title} subtitle={year} hue={hue} motif={motif} catalog={catalog} />

      {/* metadata strip */}
      <div style={{
        padding: '8px 10px',
        background: 'var(--ground-2)',
        borderTop: '2px solid var(--ground)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--f-mono)',
        fontSize: '0.7rem',
        color: 'var(--cream-dim)',
        letterSpacing: '0.04em',
      }}>
        <span>{year}</span>
        <span>{meta ?? 'R · 1.85'}</span>
        <span>{catalog?.slice(-4) ?? '00A1'}</span>
      </div>

      {/* progress bar (resume row) */}
      {progress != null && (
        <div style={{
          padding: '0 10px 10px',
          background: 'var(--ground-2)',
        }}>
          <div style={{
            height: 12,
            border: '2px solid var(--ground)',
            background: 'var(--ground-3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              width: `${Math.round(progress * 100)}%`,
              background: 'var(--phosphor)',
              boxShadow: 'inset -2px 0 0 rgba(0,0,0,0.3)',
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 4px, rgba(0,0,0,0.18) 4px 5px)',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'var(--f-mono)', fontSize: '0.62rem',
            color: 'var(--phosphor)', marginTop: 4, letterSpacing: '0.06em',
          }}>
            <span>▸ RESUME</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
        </div>
      )}

      {badge && (
        <span className={`sticker sticker--${badgeColor} sticker--r2`}
          style={{ position: 'absolute', top: 38, right: -8, fontSize: '0.6rem', padding: '3px 7px 2px' }}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TabBar — bottom remote-control
// ─────────────────────────────────────────────────────────────────────────────

function TabBar({ active = 'browse', onChange = () => {} }) {
  const tabs = [
    { id: 'home',    label: t('tab.home'),    accent: 'var(--cream)',    icon: 'home' },
    { id: 'browse',  label: t('tab.browse'),  accent: 'var(--magenta)',  icon: 'browse' },
    { id: 'rent',    label: t('tab.rent'),    accent: 'var(--acid)',     icon: 'rent' },
    { id: 'library', label: t('tab.library'), accent: 'var(--phosphor)', icon: 'library' },
    { id: 'account', label: t('tab.account'), accent: 'var(--sodium)',   icon: 'account' },
  ];

  return (
    <nav className="tabbar" aria-label="Primary" style={{
      position: 'fixed',
      bottom: 18, left: '50%', transform: 'translateX(-50%)',
      width: 'min(720px, calc(100vw - 32px))',
      background: 'var(--ground-2)',
      border: '2px solid var(--ground)',
      boxShadow: '6px 6px 0 rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
      padding: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 8,
      zIndex: 200,
      backdropFilter: 'blur(6px)',
    }}>
      {/* top "label sticker" */}
      <span style={{
        position: 'absolute', top: -14, left: 18,
        background: 'var(--cream)',
        color: 'var(--ground)',
        fontFamily: 'var(--f-kicker)',
        fontSize: '0.65rem',
        letterSpacing: '0.18em',
        padding: '3px 10px 2px',
        border: '1.5px solid var(--ground)',
        transform: 'rotate(-3deg)',
        boxShadow: '2px 2px 0 var(--ground)',
      }}>{t('shell.brand')} · Remote</span>

      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              border: '2px solid var(--ground)',
              background: isActive ? tab.accent : 'var(--ground-3)',
              color: isActive ? 'var(--ground)' : 'var(--cream)',
              boxShadow: isActive
                ? `inset 0 0 0 2px ${tab.accent}, 0 0 22px ${tab.accent}66, 2px 2px 0 var(--ground)`
                : '3px 3px 0 var(--ground)',
              padding: '12px 6px 10px',
              fontFamily: 'var(--f-kicker)',
              fontSize: '0.85rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'transform 90ms cubic-bezier(0.3, 0, 0.7, 1), box-shadow 90ms, background 120ms',
              borderRadius: 2,
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.transform = 'translate(-1px,-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; }}
          >
            <TabIcon kind={tab.icon} color={isActive ? 'var(--ground)' : tab.accent} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function TabIcon({ kind, color }) {
  const s = 22;
  const stroke = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'square', strokeLinejoin: 'miter' };
  if (kind === 'home') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 11 L12 4 L20 11 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 Z" {...stroke}/></svg>
  );
  if (kind === 'browse') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="4" width="4" height="16" {...stroke}/><rect x="9" y="4" width="4" height="16" {...stroke}/><rect x="15" y="4" width="6" height="16" {...stroke}/></svg>
  );
  if (kind === 'rent') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" {...stroke}/><circle cx="8" cy="12" r="2" {...stroke}/><circle cx="16" cy="12" r="2" {...stroke}/></svg>
  );
  if (kind === 'library') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="3" width="4" height="18" {...stroke}/><rect x="9" y="3" width="4" height="18" {...stroke}/><rect x="15" y="6" width="4" height="15" {...stroke} transform="rotate(8 17 13)"/></svg>
  );
  if (kind === 'account') return (
    <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" {...stroke}/><path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" {...stroke}/></svg>
  );
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Barcode — random-looking but deterministic
// ─────────────────────────────────────────────────────────────────────────────

function Barcode({ seed = "AKIRA" }) {
  const widths = [];
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 64; i++) {
    n = (n * 1103515245 + 12345) >>> 0;
    widths.push(1 + (n % 4));
  }
  return (
    <div className="barcode">
      {widths.map((w, i) => (
        <i key={i} style={{ width: w, opacity: i % 7 === 0 ? 0.6 : 1 }} />
      ))}
    </div>
  );
}

// Export to window so other babel scripts can use
Object.assign(window, {
  I18N, t,
  PosterPlaceholder,
  VHSBoxCard,
  TabBar,
  TabIcon,
  Barcode,
});
