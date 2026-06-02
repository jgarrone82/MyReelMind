// search.jsx — Screen 04: Store directory terminal
// Memorable moment: the CRT terminal mounted at the store entrance.

function SearchTerminal() {
  const [tw, setTweak] = useTweaks(SEARCH_DEFAULTS);
  const [query, setQuery] = React.useState('');
  const [channel, setChannel] = React.useState('all');
  const [glitchKey, setGlitchKey] = React.useState(0);
  const [debouncing, setDebouncing] = React.useState(false);
  const debTimer = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', tw.scanlines ? tw.scanlineOpacity : 0);
    document.documentElement.style.setProperty('--glow-mult', tw.glowMult);
    document.documentElement.style.setProperty('--grain-opacity', tw.grain);
  }, [tw]);

  const didGlitch = React.useRef(false);
  React.useEffect(() => {
    if (tw.glitchOnLoad && !didGlitch.current) { didGlitch.current = true; setGlitchKey(k => k + 1); }
  }, []);

  // debounce: typing -> loading skeletons for 700ms
  const onType = (v) => {
    setQuery(v);
    if (debTimer.current) clearTimeout(debTimer.current);
    if (v.trim().length > 0) {
      setDebouncing(true);
      debTimer.current = setTimeout(() => setDebouncing(false), 700);
    } else {
      setDebouncing(false);
    }
  };

  const clear = () => { setQuery(''); setDebouncing(false); inputRef.current?.focus(); };

  // Determine state. Tweak override lets designers preview states.
  let state = tw.stateOverride;
  if (state === 'auto') {
    if (tw.forceError) state = 'error';
    else if (query.trim().length === 0) state = 'initial';
    else if (debouncing) state = 'typing';
    else if (/^(zzz|xqz|out)/i.test(query.trim())) state = 'zero';
    else state = 'results';
  }

  return (
    <div className={`page ${tw.scanlines ? 'scanlines' : ''} ${tw.vignette ? 'crt' : ''}`}>
      {tw.grain > 0 && <div className="grain" />}

      <SearchHeader />

      <main key={glitchKey} className={tw.glitchOnLoad ? 'glitch-once' : ''} style={{
        padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 40px) 320px',
        maxWidth: 1280, margin: '0 auto',
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '14px 4px 22px', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="t-kicker" style={{ color: 'var(--phosphor)', fontSize: '0.8rem', marginBottom: 4 }}>{t('search.kicker')}</div>
            <h1 className="t-display aberrate" style={{ margin: 0, color: 'var(--cream)', fontSize: 'clamp(2rem, 5vw, 3.2rem)' }}>{t('search.title')}</h1>
          </div>
          <div className="t-mono" style={{ fontSize: '0.72rem', color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>{t('search.results.sub')}</div>
        </div>

        {/* CRT search input */}
        <div className="crt-search">
          <div className="crt-search__screen">
            <span className="crt-search__prompt">▸</span>
            <input
              ref={inputRef}
              className="crt-search__input"
              value={query}
              onChange={(e) => onType(e.target.value)}
              placeholder={t('search.placeholder')}
              aria-label={t('search.title')}
            />
            {debouncing && <span className="spinner-reel" style={{ color: 'var(--phosphor)' }} />}
            {query.length === 0 && !debouncing && <span className="crt-cursor" aria-hidden />}
            {query.length > 0 && (
              <button type="button" onClick={clear}
                style={{ appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  fontFamily: 'var(--f-kicker)', fontSize: '0.78rem', letterSpacing: '0.14em',
                  color: 'var(--magenta)', padding: '4px 6px', whiteSpace: 'nowrap' }}>
                ✕ {t('search.clear')}
              </button>
            )}
          </div>
        </div>

        {/* Channel selector */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
          {[
            { id: 'all', label: t('search.ch.all') },
            { id: 'movies', label: t('search.ch.movies') },
            { id: 'tv', label: t('search.ch.tv') },
            { id: 'anime', label: t('search.ch.anime') },
          ].map(ch => (
            <button key={ch.id} type="button" className="channel-pill"
              aria-pressed={channel === ch.id}
              onClick={() => setChannel(ch.id)}>
              <span className="channel-pill__led" />
              {ch.label}
            </button>
          ))}
        </div>

        {/* State body */}
        <div style={{ marginTop: 30 }}>
          {state === 'initial' && <InitialBrowse />}
          {state === 'typing'  && <LoadingGrid />}
          {state === 'results' && <ResultsGrid query={query || 'Alien'} />}
          {state === 'zero'    && <ZeroState query={query || 'zzzqx'} />}
          {state === 'error'   && <ErrorState onRetry={() => { setTweak('forceError', false); setTweak('stateOverride', 'auto'); }} />}
        </div>

        <SearchFooter />
      </main>

      <TabBar active="browse" onChange={(id) => {
        if (id === 'home') window.location.href = 'dashboard.html';
        else if (id === 'account') window.location.href = 'login.html';
        else if (id === 'rent') window.location.href = 'index.html';
        else setGlitchKey(k => k + 1);
      }} />

      <TweaksPanel title="Tweaks · CRT controls">
        <TweakSection label="Screen state" />
        <TweakSelect label="State" value={tw.stateOverride}
          options={[
            { value: 'auto', label: 'Auto (type to drive)' },
            { value: 'initial', label: 'Initial — browse' },
            { value: 'typing', label: 'Typing — skeletons' },
            { value: 'results', label: 'Results grid' },
            { value: 'zero', label: 'Out of stock' },
            { value: 'error', label: 'Terminal offline' },
          ]}
          onChange={(v) => setTweak('stateOverride', v)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="Scanlines" value={tw.scanlines} onChange={(v) => setTweak('scanlines', v)} />
        <TweakSlider label="Scanline density" value={tw.scanlineOpacity} min={0} max={0.4} step={0.02} onChange={(v) => setTweak('scanlineOpacity', v)} />
        <TweakToggle label="CRT vignette" value={tw.vignette} onChange={(v) => setTweak('vignette', v)} />
        <TweakSlider label="Film grain" value={tw.grain} min={0} max={0.18} step={0.01} onChange={(v) => setTweak('grain', v)} />

        <TweakSection label="Phosphor" />
        <TweakSlider label="Glow intensity" value={tw.glowMult} min={0} max={2.4} step={0.1} onChange={(v) => setTweak('glowMult', v)} />

        <TweakSection label="Motion" />
        <TweakToggle label="Glitch on load" value={tw.glitchOnLoad} onChange={(v) => setTweak('glitchOnLoad', v)} />
      </TweaksPanel>
    </div>
  );
}

const SEARCH_DEFAULTS = /*EDITMODE-BEGIN*/{
  "stateOverride": "auto",
  "forceError": false,
  "scanlines": true,
  "scanlineOpacity": 0.18,
  "vignette": true,
  "grain": 0.05,
  "glowMult": 1.0,
  "glitchOnLoad": true
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────────────
// Shelf row helper (horizontal scroll)
// ─────────────────────────────────────────────────────────────────────────────

function Shelf({ label, accent, note, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 14,
        borderBottom: '3px double var(--cream-dim)', paddingBottom: 8, marginBottom: 20, flexWrap: 'wrap',
      }}>
        <span className="t-kicker" style={{ color: accent, fontSize: '1.05rem', textShadow: `0 0 12px ${accent}55`, borderBottom: `3px solid ${accent}`, paddingBottom: 2, whiteSpace: 'nowrap' }}>{label}</span>
        {note && <span style={{ fontFamily: 'var(--f-marker)', color: 'var(--sodium)', fontSize: '1rem', transform: 'rotate(-2deg)', display: 'inline-block' }}>{note}</span>}
      </div>
      <div className="shelf-scroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(170px, 190px)', gap: 22, overflowX: 'auto', paddingBottom: 14 }}>
        {children}
      </div>
    </section>
  );
}

function InitialBrowse() {
  const popular = [
    { title: t('search.pop.1.title'), year: t('search.pop.1.year'), hue: 'phosphor', motif: 'silhouette', catalog: 'MRM-00211-A', badge: t('detail.stickers.staff'), badgeColor: 'acid' },
    { title: t('search.pop.2.title'), year: t('search.pop.2.year'), hue: 'magenta',  motif: 'mesh',       catalog: 'MRM-00077-B' },
    { title: t('search.pop.3.title'), year: t('search.pop.3.year'), hue: 'acid',     motif: 'grid',       catalog: 'MRM-00318-A' },
    { title: t('search.pop.4.title'), year: t('search.pop.4.year'), hue: 'sodium',   motif: 'triangle',   catalog: 'MRM-00142-C' },
    { title: t('search.pop.5.title'), year: t('search.pop.5.year'), hue: 'magenta',  motif: 'spool',      catalog: 'MRM-00501-A', badge: t('detail.stickers.new'), badgeColor: 'magenta' },
    { title: t('search.pop.6.title'), year: t('search.pop.6.year'), hue: 'cream',    motif: 'circle',     catalog: 'MRM-00633-B' },
  ];
  const staff = [
    { title: t('search.sp.1.title'), year: t('search.sp.1.year'), hue: 'phosphor', motif: 'circle',     catalog: 'MRM-00801-A' },
    { title: t('search.sp.2.title'), year: t('search.sp.2.year'), hue: 'sodium',   motif: 'mesh',       catalog: 'MRM-00802-A' },
    { title: t('search.sp.3.title'), year: t('search.sp.3.year'), hue: 'acid',     motif: 'silhouette', catalog: 'MRM-00803-B' },
    { title: t('search.sp.4.title'), year: t('search.sp.4.year'), hue: 'magenta',  motif: 'triangle',   catalog: 'MRM-00804-A' },
    { title: t('search.sp.5.title'), year: t('search.sp.5.year'), hue: 'cream',    motif: 'grid',       catalog: 'MRM-00805-C' },
  ];
  return (
    <>
      <Shelf label={t('search.now.head')} accent="var(--acid)">
        {popular.map((it, i) => <VHSBoxCard key={i} {...it} />)}
      </Shelf>
      <Shelf label={t('search.staff.head')} accent="var(--sodium)" note={t('search.staff.note')}>
        {staff.map((it, i) => <VHSBoxCard key={i} {...it} />)}
      </Shelf>
    </>
  );
}

function LoadingGrid() {
  return (
    <div>
      <div className="t-mono" style={{ color: 'var(--phosphor)', fontSize: '0.85rem', letterSpacing: '0.16em', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="spinner-reel" style={{ color: 'var(--phosphor)' }} /> {t('search.typing')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 22 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="tape-skeleton" style={{ animationDelay: `${(i % 6) * 0.1}s` }}>
            <div className="sk-strip" />
            <div className="sk-poster" />
            <div className="sk-foot" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsGrid({ query }) {
  const results = [
    { title: t('search.res.1.title'), year: t('search.res.1.year'), hue: 'phosphor', motif: 'circle',     catalog: 'MRM-00149-A', badge: t('detail.stickers.staff'), badgeColor: 'acid' },
    { title: t('search.res.2.title'), year: t('search.res.2.year'), hue: 'magenta',  motif: 'silhouette', catalog: 'MRM-00679-B' },
    { title: t('search.res.3.title'), year: t('search.res.3.year'), hue: 'sodium',   motif: 'triangle',   catalog: 'MRM-00800-A' },
    { title: t('search.res.4.title'), year: t('search.res.4.year'), hue: 'acid',     motif: 'mesh',       catalog: 'MRM-00951-C' },
    { title: t('search.res.5.title'), year: t('search.res.5.year'), hue: 'cream',    motif: 'grid',       catalog: 'MRM-01270-A' },
    { title: t('search.res.6.title'), year: t('search.res.6.year'), hue: 'phosphor', motif: 'spool',      catalog: 'MRM-01401-B' },
    { title: t('search.res.7.title'), year: t('search.res.7.year'), hue: 'sodium',   motif: 'silhouette', catalog: 'MRM-00188-A' },
    { title: t('search.res.8.title'), year: t('search.res.8.year'), hue: 'magenta',  motif: 'mesh',       catalog: 'MRM-00422-A' },
  ];
  const head = t('search.results.head').replace('{n}', '47');
  return (
    <div>
      {/* receipt-style header */}
      <div style={{ marginBottom: 24 }}>
        <div className="t-mono" style={{
          color: 'var(--cream)', fontSize: '0.95rem', letterSpacing: '0.06em',
          display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--phosphor)' }}>▸</span>
          {head} <span style={{ color: 'var(--acid)', fontFamily: 'var(--f-display)', fontSize: '1.15rem' }}>'{query.toUpperCase()}'</span>
        </div>
        <div style={{ borderBottom: '2px dashed var(--cream-dim)', marginTop: 8 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 22 }}>
        {results.map((it, i) => <VHSBoxCard key={i} {...it} />)}
      </div>
    </div>
  );
}

function ZeroState({ query }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '30px 0 10px' }}>
      {/* black box silhouette with OUT OF STOCK sticker */}
      <div style={{ position: 'relative', width: 'min(260px, 70vw)' }}>
        <div style={{
          width: '100%', aspectRatio: '2/3',
          background: 'var(--ground-2)', border: '2px solid var(--ground)',
          boxShadow: '8px 8px 0 rgba(0,0,0,0.8)',
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.02) 0 12px, transparent 12px 28px)',
          display: 'grid', placeItems: 'center',
        }}>
          <span className="t-kicker" style={{ color: 'var(--ground-4)', fontSize: '1rem', letterSpacing: '0.2em', transform: 'rotate(-90deg)' }}>NO TAPE</span>
        </div>
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%) rotate(-9deg)',
          background: 'var(--magenta)', color: 'var(--cream)',
          border: '2px solid var(--ground)', boxShadow: '4px 4px 0 var(--ground)',
          padding: '12px 20px', textAlign: 'center', width: 'max-content', maxWidth: '90%',
        }}>
          <div className="t-display" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{t('search.zero.head')}</div>
          <div className="t-kicker" style={{ fontSize: '0.66rem', letterSpacing: '0.16em', marginTop: 4 }}>CHECK AGAIN LATER</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <p style={{ margin: '0 0 12px', color: 'var(--cream-dim)', fontFamily: 'var(--f-mono)', fontSize: '0.9rem' }}>{t('search.zero.sub')}</p>
        <div className="t-mono" style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--acid)' }}>{t('search.zero.try')}</span>{' '}
          <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <span className="sticker sticker--phosphor sticker--r1" style={{ fontSize: '0.6rem' }}>Sci-Fi</span>
            <span className="sticker sticker--acid sticker--r2" style={{ fontSize: '0.6rem' }}>1980s</span>
            <span className="sticker sticker--sodium sticker--r3" style={{ fontSize: '0.6rem' }}>Cronenberg</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ maxWidth: 560, margin: '20px auto 0' }}>
      <div style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        background: 'var(--error)', color: 'var(--cream)',
        border: '2px solid var(--ground)', boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
        padding: '16px 18px',
      }}>
        <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', lineHeight: 1 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <div className="t-kicker" style={{ fontSize: '0.92rem', letterSpacing: '0.16em' }}>{t('search.error.head')}</div>
          <div className="t-mono" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginTop: 4 }}>{t('search.error.body')}</div>
          <button type="button" onClick={onRetry} className="btn btn--secondary" style={{ marginTop: 14, fontSize: '0.82rem', padding: '10px 16px' }}>
            ↻ {t('search.error.retry')}
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchHeader() {
  return (
    <header data-screen-label="Search · Header" style={{
      borderBottom: '2px solid var(--phosphor)',
      boxShadow: '0 2px 0 var(--ground-3), 0 3px 18px rgba(74,255,240,0.12)',
      padding: '14px clamp(12px, 3vw, 40px)',
      display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16,
      maxWidth: 1280, margin: '0 auto',
    }}>
      <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 38, height: 38, background: 'var(--magenta)', border: '2px solid var(--ground)', boxShadow: '3px 3px 0 var(--ground)', display: 'grid', placeItems: 'center', color: 'var(--cream)', fontFamily: 'var(--f-display)', fontSize: '1.5rem', transform: 'rotate(-3deg)' }}>M</div>
        <div>
          <div className="t-display" style={{ fontSize: '1.55rem', color: 'var(--cream)', lineHeight: 0.95 }}>{t('shell.brand')}</div>
          <div className="t-mono" style={{ fontSize: '0.7rem', color: 'var(--cream-dim)', letterSpacing: '0.06em' }}>{t('shell.brand.sub')}</div>
        </div>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="t-kicker" style={{ color: 'var(--acid)', fontSize: '0.78rem', padding: '4px 10px 3px', border: '1.5px solid var(--acid)' }}>● OPEN</div>
        <a href="login.html" className="btn aberrate" style={{ fontSize: '0.85rem', padding: '11px 18px', minWidth: 0, textDecoration: 'none' }}>{t('shell.signin')}</a>
      </div>
    </header>
  );
}

function SearchFooter() {
  return (
    <footer style={{ maxWidth: 1200, margin: '64px auto 0', borderTop: '2px solid var(--ground-3)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', color: 'var(--cream-dim)', fontFamily: 'var(--f-mono)', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
      <span>© 1985–2026 {t('shell.brand')} · Directory terminal</span>
      <span>v1.4.0 · CRT TUBE OK · TRACKING NOMINAL</span>
    </footer>
  );
}

const searchRoot = ReactDOM.createRoot(document.getElementById('root'));
searchRoot.render(<SearchTerminal />);
