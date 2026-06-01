// dashboard.jsx — Screen 01: Member Home / "Your Activity"
// Anchored on the dot-matrix RECEIPT as a member card.

function Dashboard() {
  const [tw, setTweak] = useTweaks(DASH_DEFAULTS);
  const [glitchKey, setGlitchKey] = React.useState(0);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', tw.scanlines ? tw.scanlineOpacity : 0);
    document.documentElement.style.setProperty('--glow-mult', tw.glowMult);
    document.documentElement.style.setProperty('--grain-opacity', tw.grain);
  }, [tw]);

  const didGlitch = React.useRef(false);
  React.useEffect(() => {
    if (tw.glitchOnLoad && !didGlitch.current) { didGlitch.current = true; setGlitchKey(k => k + 1); }
  }, []);

  const state = tw.dataState; // 'empty' | 'light' | 'populated'

  return (
    <div className={`page ${tw.scanlines ? 'scanlines' : ''} ${tw.vignette ? 'crt' : ''}`}>
      {tw.grain > 0 && <div className="grain" />}

      <DashHeader />

      <main
        key={glitchKey}
        className={tw.glitchOnLoad ? 'glitch-once' : ''}
        style={{
          padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 40px) 320px',
          maxWidth: 1280, margin: '0 auto',
        }}>

        <PageTitle />

        {/* Receipt member card — the anchor */}
        <ReceiptMemberCard state={state} />

        {state === 'empty' ? (
          <EmptyState />
        ) : (
          <>
            <ResumeRow state={state} />
            {state === 'populated' && <WatchedRow />}
            <AddedRow state={state} />
            <ActivityFeed state={state} />
          </>
        )}

        <DashFooter />
      </main>

      <TabBar active="home" onChange={(id) => {
        if (id === 'browse' || id === 'rent') { window.location.href = 'index.html'; }
        else { setGlitchKey(k => k + 1); }
      }} />

      <TweaksPanel title="Tweaks · CRT controls">
        <TweakSection label="Screen data state" />
        <TweakRadio
          value={tw.dataState}
          options={[
            { value: 'empty', label: 'Empty' },
            { value: 'light', label: 'Light' },
            { value: 'populated', label: 'Full' },
          ]}
          onChange={(v) => setTweak('dataState', v)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="Scanlines" value={tw.scanlines} onChange={(v) => setTweak('scanlines', v)} />
        <TweakSlider label="Scanline density" value={tw.scanlineOpacity} min={0} max={0.4} step={0.02} onChange={(v) => setTweak('scanlineOpacity', v)} />
        <TweakToggle label="CRT vignette" value={tw.vignette} onChange={(v) => setTweak('vignette', v)} />
        <TweakSlider label="Film grain" value={tw.grain} min={0} max={0.18} step={0.01} onChange={(v) => setTweak('grain', v)} />

        <TweakSection label="Phosphor" />
        <TweakSlider label="Glow intensity" value={tw.glowMult} min={0} max={2.4} step={0.1} onChange={(v) => setTweak('glowMult', v)} />

        <TweakSection label="Motion" />
        <TweakToggle label="Glitch on load" value={tw.glitchOnLoad} onChange={(v) => setTweak('glitchOnLoad', v)} />
        <TweakButton label="Trigger tracking error" onClick={() => setGlitchKey(k => k + 1)} />
      </TweaksPanel>
    </div>
  );
}

const DASH_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dataState": "populated",
  "scanlines": true,
  "scanlineOpacity": 0.18,
  "vignette": true,
  "grain": 0.05,
  "glowMult": 1.0,
  "glitchOnLoad": true
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────────────
// Header — logged-in variant (member chip instead of SIGN IN)
// ─────────────────────────────────────────────────────────────────────────────

function DashHeader() {
  return (
    <header data-screen-label="Dashboard · Header" style={{
      borderBottom: '2px solid var(--phosphor)',
      boxShadow: '0 2px 0 var(--ground-3), 0 3px 18px rgba(74,255,240,0.12)',
      padding: '14px clamp(12px, 3vw, 40px)',
      display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16,
      maxWidth: 1280, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 38, height: 38, background: 'var(--magenta)', border: '2px solid var(--ground)',
            boxShadow: '3px 3px 0 var(--ground)', display: 'grid', placeItems: 'center',
            color: 'var(--cream)', fontFamily: 'var(--f-display)', fontSize: '1.5rem', transform: 'rotate(-3deg)',
          }}>M</div>
          <div>
            <div className="t-display" style={{ fontSize: '1.55rem', color: 'var(--cream)', lineHeight: 0.95 }}>{t('shell.brand')}</div>
            <div className="t-mono" style={{ fontSize: '0.7rem', color: 'var(--cream-dim)', letterSpacing: '0.06em' }}>{t('shell.brand.sub')}</div>
          </div>
        </a>
        <div className="t-kicker" style={{
          color: 'var(--acid)', fontSize: '0.78rem', padding: '4px 10px 3px',
          border: '1.5px solid var(--acid)', marginLeft: 4,
        }}>● OPEN</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="t-mono" style={{ fontSize: '0.75rem', color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
          {t('dashboard.membercard.no_v')}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: '2px solid var(--ground)', background: 'var(--ground-3)',
          boxShadow: '3px 3px 0 var(--ground)', padding: '6px 12px 6px 8px',
        }}>
          <div style={{
            width: 26, height: 26, background: 'var(--phosphor)', color: 'var(--ground)',
            display: 'grid', placeItems: 'center', fontFamily: 'var(--f-display)', fontSize: '0.9rem',
            border: '1.5px solid var(--ground)',
          }}>R</div>
          <span className="t-kicker" style={{ color: 'var(--cream)', fontSize: '0.82rem' }}>{t('dashboard.membercard.name_v')}</span>
        </div>
      </div>
    </header>
  );
}

function PageTitle() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '20px 4px 24px', gap: 12, flexWrap: 'wrap',
    }}>
      <div>
        <div className="t-kicker" style={{ color: 'var(--sodium)', fontSize: '0.8rem', marginBottom: 4 }}>
          {t('dashboard.kicker')}
        </div>
        <h1 className="t-display aberrate" style={{ margin: 0, color: 'var(--cream)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>
          {t('dashboard.your_activity')}
        </h1>
      </div>
      <div className="t-mono" style={{ fontSize: '0.72rem', color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>
        {t('dashboard.greeting')} · {t('shell.brand.open')}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECEIPT MEMBER CARD — the anchored memorable moment
// ─────────────────────────────────────────────────────────────────────────────

function ReceiptMemberCard({ state }) {
  const data = {
    empty:     { completed: '0',  hours: '0.0',  progress: '0',  towatch: '0',  subtotal: '0' },
    light:     { completed: '3',  hours: '6.2',  progress: '1',  towatch: '4',  subtotal: '3' },
    populated: { completed: '128', hours: '291.4', progress: '5', towatch: '37', subtotal: '170' },
  }[state];

  const lines = [
    { key: 'dashboard.stat.completed', v: data.completed, accent: 'var(--magenta)' },
    { key: 'dashboard.stat.hours',     v: data.hours,     accent: 'var(--phosphor)' },
    { key: 'dashboard.stat.progress',  v: data.progress,  accent: 'var(--sodium)' },
    { key: 'dashboard.stat.towatch',   v: data.towatch,   accent: 'var(--acid)' },
  ];

  return (
    <section data-screen-label="Dashboard · Member card receipt" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      maxWidth: 560, margin: '0 auto 8px',
      transform: 'rotate(-0.6deg)',
    }}>
      <div className="receipt hard-shadow" style={{ paddingTop: 22, paddingBottom: 22 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--f-kicker)', fontSize: '0.92rem', letterSpacing: '0.16em', color: 'var(--ground)' }}>
            {t('dashboard.membercard.head')}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--ground)', opacity: 0.6, marginTop: 2 }}>
            {t('dashboard.membercard.store')}
          </div>
        </div>

        {/* Member meta */}
        <div className="receipt-row"><span>{t('dashboard.membercard.name')}</span><span className="v">{t('dashboard.membercard.name_v')}</span></div>
        <div className="receipt-row"><span>{t('dashboard.membercard.since')}</span><span className="v">{t('dashboard.membercard.since_v')}</span></div>
        <div className="receipt-row"><span>{t('dashboard.membercard.no')}</span><span className="v">{t('dashboard.membercard.no_v')}</span></div>

        {/* Tally header */}
        <div style={{
          textAlign: 'center', margin: '14px 0 6px',
          fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: '0.78rem',
          letterSpacing: '0.14em', color: 'var(--ground)',
        }}>
          {t('dashboard.receipt.head')}
          <div style={{ fontWeight: 400, fontSize: '0.64rem', opacity: 0.6, letterSpacing: '0.08em', marginTop: 2 }}>
            {t('dashboard.receipt.date')}
          </div>
        </div>

        {/* The four big stat lines — printed-off-register numbers */}
        <div style={{ borderTop: '2px dashed rgba(10,8,7,0.4)', borderBottom: '2px dashed rgba(10,8,7,0.4)', padding: '8px 0' }}>
          {lines.map((ln) => (
            <button key={ln.key} type="button"
              title={t('dashboard.receipt.drill')}
              style={{
                width: '100%', appearance: 'none', border: 0, background: 'transparent',
                cursor: 'pointer', textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '6px 2px', borderRadius: 0,
                transition: 'background 80ms',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(10,8,7,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: '0.86rem', color: 'var(--ground)',
                letterSpacing: '0.02em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ width: 8, height: 8, background: ln.accent, border: '1px solid var(--ground)', display: 'inline-block' }} />
                {t(ln.key)}
              </span>
              {/* dot leaders */}
              <span aria-hidden style={{ flex: 1, margin: '0 8px', borderBottom: '2px dotted rgba(10,8,7,0.35)', transform: 'translateY(-4px)' }} />
              <span style={{
                fontFamily: 'var(--f-display)', fontSize: '1.7rem', lineHeight: 1,
                color: 'var(--ground)', textShadow: `2px 2px 0 ${ln.accent}`,
              }}>{ln.v}</span>
            </button>
          ))}
        </div>

        {/* Subtotal */}
        <div className="receipt-row" style={{ borderBottom: 0, marginTop: 8, fontWeight: 700 }}>
          <span style={{ fontFamily: 'var(--f-mono)', letterSpacing: '0.06em' }}>{t('dashboard.receipt.subtotal')}</span>
          <span className="v" style={{ fontSize: '1rem' }}>{data.subtotal}</span>
        </div>

        {/* Barcode */}
        <div style={{ marginTop: 12 }}>
          <Barcode seed={`MRM${data.subtotal}MEMBER`} />
          <div style={{ textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: '0.66rem', color: 'var(--ground)', letterSpacing: '0.2em', marginTop: 6 }}>
            {t('dashboard.membercard.no_v')}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--f-marker)', fontSize: '1.05rem', color: 'var(--magenta)', transform: 'rotate(-1.5deg)' }}>
          {t('dashboard.receipt.thanks')}
        </div>
        <div style={{ textAlign: 'center', marginTop: 4, fontFamily: 'var(--f-mono)', fontSize: '0.62rem', color: 'var(--ground)', opacity: 0.55 }}>
          {t('dashboard.receipt.drill')}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shelf rows
// ─────────────────────────────────────────────────────────────────────────────

function ShelfRow({ label, accent = 'var(--acid)', note, children, count }) {
  return (
    <section style={{ maxWidth: 1200, margin: '40px auto 0' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '3px double var(--cream-dim)', paddingBottom: 8, marginBottom: 22, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="t-kicker" style={{
            color: accent, fontSize: '1.05rem', textShadow: `0 0 12px ${accent}55`,
            borderBottom: `3px solid ${accent}`, paddingBottom: 2, whiteSpace: 'nowrap',
          }}>{label}</span>
          {count != null && (
            <span className="t-mono" style={{ fontSize: '0.72rem', color: 'var(--cream-dim)' }}>[{count}]</span>
          )}
          {note && (
            <span style={{ fontFamily: 'var(--f-marker)', color: 'var(--sodium)', fontSize: '1rem', transform: 'rotate(-2deg)', display: 'inline-block' }}>{note}</span>
          )}
        </div>
        <button className="btn btn--ghost aberrate">{t('dashboard.row.seeall')} →</button>
      </div>
      <div className="shelf-scroll" style={{
        display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(180px, 200px)',
        gap: 22, overflowX: 'auto', paddingBottom: 14,
      }}>
        {children}
      </div>
    </section>
  );
}

function ResumeRow({ state }) {
  const items = [
    { title: t('dashboard.resume.1.title'), year: t('dashboard.resume.1.year'), hue: 'sodium',   motif: 'grid',     catalog: 'MRM-00231-A', progress: 0.62 },
    { title: t('dashboard.resume.2.title'), year: t('dashboard.resume.2.year'), hue: 'phosphor', motif: 'mesh',     catalog: 'MRM-00078-C', progress: 0.34 },
    { title: t('dashboard.resume.3.title'), year: t('dashboard.resume.3.year'), hue: 'magenta',  motif: 'spool',    catalog: 'MRM-00992-A', progress: 0.81 },
  ];
  const shown = state === 'light' ? items.slice(0, 1) : items;
  return (
    <ShelfRow label={t('dashboard.row.resume')} accent="var(--phosphor)" count={state === 'light' ? 1 : 5}>
      {shown.map((it, i) => (
        <VHSBoxCard key={i} {...it} />
      ))}
    </ShelfRow>
  );
}

function WatchedRow() {
  const items = [
    { title: t('related.1.title'), year: t('related.1.year'), hue: 'magenta',  motif: 'silhouette', catalog: 'MRM-00128-B', badge: t('dashboard.feed.watched'), badgeColor: 'phosphor' },
    { title: t('related.5.title'), year: t('related.5.year'), hue: 'cream',    motif: 'circle',     catalog: 'MRM-00188-A' },
    { title: t('related.4.title'), year: t('related.4.year'), hue: 'acid',     motif: 'grid',       catalog: 'MRM-00712-A' },
    { title: t('related.2.title'), year: t('related.2.year'), hue: 'phosphor', motif: 'mesh',       catalog: 'MRM-00930-A' },
    { title: t('related.6.title'), year: t('related.6.year'), hue: 'phosphor', motif: 'triangle',   catalog: 'MRM-01093-B' },
  ];
  return (
    <ShelfRow label={t('dashboard.row.watched')} accent="var(--acid)" count={128} note="★ logged tonight">
      {items.map((it, i) => <VHSBoxCard key={i} {...it} />)}
    </ShelfRow>
  );
}

function AddedRow({ state }) {
  const items = [
    { title: t('dashboard.added.1.title'), year: t('dashboard.added.1.year'), hue: 'magenta',  motif: 'spool',    catalog: 'MRM-01188-A', badge: t('detail.stickers.new'), badgeColor: 'acid' },
    { title: t('dashboard.added.2.title'), year: t('dashboard.added.2.year'), hue: 'phosphor', motif: 'mesh',     catalog: 'MRM-01204-B' },
    { title: t('dashboard.added.3.title'), year: t('dashboard.added.3.year'), hue: 'sodium',   motif: 'triangle', catalog: 'MRM-01231-A' },
    { title: t('dashboard.added.4.title'), year: t('dashboard.added.4.year'), hue: 'acid',     motif: 'grid',     catalog: 'MRM-01266-C' },
  ];
  const shown = state === 'light' ? items.slice(0, 3) : items;
  return (
    <ShelfRow label={t('dashboard.row.added')} accent="var(--sodium)" count={shown.length}>
      {shown.map((it, i) => <VHSBoxCard key={i} {...it} />)}
    </ShelfRow>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity feed — register-tape printout
// ─────────────────────────────────────────────────────────────────────────────

function ActivityFeed({ state }) {
  const feedFull = [
    { type: t('dashboard.feed.watched'),  title: t('related.1.title'), ts: 'TODAY · 21:14', c: 'var(--acid)' },
    { type: t('dashboard.feed.rated'),    title: 'Brazil · ★★★★½',      ts: 'TODAY · 20:02', c: 'var(--magenta)' },
    { type: t('dashboard.feed.added'),    title: t('dashboard.added.1.title'), ts: 'MON · 23:50', c: 'var(--sodium)' },
    { type: t('dashboard.feed.progress'), title: 'Tron · 34%',          ts: 'MON · 22:31', c: 'var(--phosphor)' },
    { type: t('dashboard.feed.watched'),  title: t('related.5.title'),  ts: 'SUN · 19:08', c: 'var(--acid)' },
    { type: t('dashboard.feed.added'),    title: t('dashboard.added.3.title'), ts: 'SAT · 18:45', c: 'var(--sodium)' },
  ];
  const feed = state === 'light' ? feedFull.slice(0, 2) : feedFull;

  return (
    <section style={{ maxWidth: 1200, margin: '44px auto 0' }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '3px double var(--cream-dim)', paddingBottom: 8, marginBottom: 18, gap: 12, flexWrap: 'wrap',
      }}>
        <span className="t-kicker" style={{ color: 'var(--magenta)', fontSize: '1.05rem', borderBottom: '3px solid var(--magenta)', paddingBottom: 2 }}>
          {t('dashboard.row.feed')}
        </span>
        <button className="btn btn--ghost aberrate">{t('dashboard.row.seeall')} →</button>
      </div>

      <div className="receipt" style={{ maxWidth: 640, padding: '20px 18px' }}>
        {feed.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            padding: '7px 0', borderBottom: i < feed.length - 1 ? '1px dashed rgba(10,8,7,0.28)' : 0,
          }}>
            <span style={{
              fontFamily: 'var(--f-kicker)', fontSize: '0.68rem', letterSpacing: '0.1em',
              color: 'var(--ground)', background: f.c, border: '1.5px solid var(--ground)',
              padding: '2px 7px 1px', boxShadow: '2px 2px 0 var(--ground)', whiteSpace: 'nowrap',
            }}>{f.type}</span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.85rem', color: 'var(--ground)', fontWeight: 600 }}>{f.title}</span>
            <span aria-hidden style={{ flex: 1, borderBottom: '2px dotted rgba(10,8,7,0.3)', transform: 'translateY(-3px)' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: 'var(--ground)', opacity: 0.65, whiteSpace: 'nowrap' }}>{f.ts}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state — STORE CLOSED, RENT SOMETHING
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <section data-screen-label="Dashboard · Empty state" style={{
      maxWidth: 760, margin: '40px auto 0',
      border: '2px solid var(--ground)', background: 'var(--ground-2)',
      boxShadow: '8px 8px 0 rgba(0,0,0,0.85)', position: 'relative', overflow: 'hidden',
    }}>
      {/* CLOSED diagonal banner */}
      <div style={{
        position: 'absolute', top: 26, right: -52, zIndex: 3,
        background: 'var(--error)', color: 'var(--cream)',
        fontFamily: 'var(--f-kicker)', fontSize: '0.9rem', letterSpacing: '0.2em',
        padding: '6px 56px', transform: 'rotate(38deg)',
        border: '2px solid var(--ground)', boxShadow: '2px 2px 0 var(--ground)',
      }}>CLOSED</div>

      <div style={{ padding: 'clamp(28px, 5vw, 48px)', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Neon OPEN/CLOSED sign motif */}
          <div style={{
            width: 84, height: 84, border: '4px solid var(--error)', borderRadius: '50%',
            display: 'grid', placeItems: 'center', color: 'var(--error)', transform: 'rotate(-6deg)',
            fontFamily: 'var(--f-kicker)', fontSize: '0.72rem', letterSpacing: '0.12em', textAlign: 'center',
            boxShadow: 'inset 0 0 0 2px var(--error)', lineHeight: 1.1,
          }}>STORE<br/>CLOSED</div>
          <div>
            <div className="t-kicker" style={{ color: 'var(--error)', fontSize: '0.82rem', marginBottom: 4 }}>{t('dashboard.empty.kicker')}</div>
            <h2 className="t-display aberrate" style={{ margin: 0, color: 'var(--cream)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              {t('dashboard.empty.head')}
            </h2>
          </div>
        </div>

        <p style={{
          margin: 0, color: 'var(--cream-dim)', fontFamily: 'var(--f-mono)',
          fontSize: '0.95rem', lineHeight: 1.6, textWrap: 'pretty', maxWidth: 520,
        }}>{t('dashboard.empty.body')}</p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
          <a href="index.html" className="btn aberrate" style={{ textDecoration: 'none', display: 'inline-block' }}>
            {t('dashboard.empty.cta')}
          </a>
          <button className="btn btn--secondary">{t('dashboard.empty.cta2')}</button>
        </div>

        <div style={{ fontFamily: 'var(--f-marker)', color: 'var(--sodium)', fontSize: '1.15rem', transform: 'rotate(-1.5deg)', marginTop: 6 }}>
          {t('dashboard.empty.note')}
        </div>
      </div>
    </section>
  );
}

function DashFooter() {
  return (
    <footer style={{
      maxWidth: 1200, margin: '64px auto 0', borderTop: '2px solid var(--ground-3)', paddingTop: 16,
      display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
      color: 'var(--cream-dim)', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', letterSpacing: '0.05em',
    }}>
      <span>© 1985–2026 {t('shell.brand')} · Member terminal</span>
      <span>v1.4.0 · CRT TUBE OK · TRACKING NOMINAL</span>
    </footer>
  );
}

const dashRoot = ReactDOM.createRoot(document.getElementById('root'));
dashRoot.render(<Dashboard />);
