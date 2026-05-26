// app.jsx — page shell, header, tweaks wiring, mount

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scanlines": true,
  "scanlineOpacity": 0.18,
  "vignette": true,
  "grain": 0.05,
  "glowMult": 1.0,
  "glitchOnLoad": true,
  "tilt": true,
  "accent": "magenta"
}/*EDITMODE-END*/;

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [activeTab, setActiveTab] = React.useState('browse');
  const [glitchKey, setGlitchKey] = React.useState(0);

  // Apply tweaks to CSS vars
  React.useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', tw.scanlines ? tw.scanlineOpacity : 0);
    document.documentElement.style.setProperty('--glow-mult', tw.glowMult);
    document.documentElement.style.setProperty('--grain-opacity', tw.grain);
  }, [tw]);

  // First-load tracking glitch (no continuous motion — user said small motion only)
  const didGlitchRef = React.useRef(false);
  React.useEffect(() => {
    if (tw.glitchOnLoad && !didGlitchRef.current) {
      didGlitchRef.current = true;
      setGlitchKey(k => k + 1);
    }
  }, []);

  // Tab change → tiny glitch
  const handleTab = (id) => {
    setActiveTab(id);
    setGlitchKey(k => k + 1);
  };

  return (
    <div className={`page ${tw.scanlines ? 'scanlines' : ''} ${tw.vignette ? 'crt' : ''}`}>
      {tw.grain > 0 && <div className="grain" />}

      {/* Header */}
      <Header />

      {/* Main */}
      <main
        key={glitchKey}
        className={tw.glitchOnLoad ? 'glitch-once' : ''}
        style={{
          padding: 'clamp(16px, 3vw, 32px) clamp(12px, 3vw, 40px) 320px',
          maxWidth: 1280,
          margin: '0 auto',
        }}>

        <Breadcrumb />

        <UnfoldedVHS />

        <MembersOnlyPanel />

        <RelatedShelf />

        <Footer />
      </main>

      {/* Bottom remote tab bar */}
      <TabBar active={activeTab} onChange={handleTab} />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks · CRT controls">
        <TweakSection label="Atmosphere" />
        <TweakToggle label="Scanlines"      value={tw.scanlines}
                     onChange={(v) => setTweak('scanlines', v)} />
        <TweakSlider label="Scanline density" value={tw.scanlineOpacity}
                     min={0} max={0.4} step={0.02}
                     onChange={(v) => setTweak('scanlineOpacity', v)} />
        <TweakToggle label="CRT vignette"   value={tw.vignette}
                     onChange={(v) => setTweak('vignette', v)} />
        <TweakSlider label="Film grain"     value={tw.grain}
                     min={0} max={0.18} step={0.01}
                     onChange={(v) => setTweak('grain', v)} />

        <TweakSection label="Phosphor" />
        <TweakSlider label="Glow intensity" value={tw.glowMult}
                     min={0} max={2.4} step={0.1}
                     onChange={(v) => setTweak('glowMult', v)} />

        <TweakSection label="Motion" />
        <TweakToggle label="Glitch on load" value={tw.glitchOnLoad}
                     onChange={(v) => setTweak('glitchOnLoad', v)} />
        <TweakToggle label="Tilt VHS cards on hover" value={tw.tilt}
                     onChange={(v) => setTweak('tilt', v)} />
        <TweakButton label="Trigger tracking error"
                     onClick={() => setGlitchKey(k => k + 1)} />
      </TweaksPanel>
    </div>
  );
}

function Header() {
  return (
    <header data-screen-label="Shell · Header" style={{
      borderBottom: '2px solid var(--ground-3)',
      padding: '14px clamp(12px, 3vw, 40px)',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: 16,
      maxWidth: 1280,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Faux logo mark */}
          <div style={{
            width: 38, height: 38,
            background: 'var(--magenta)',
            border: '2px solid var(--ground)',
            boxShadow: '3px 3px 0 var(--ground)',
            display: 'grid', placeItems: 'center',
            color: 'var(--cream)',
            fontFamily: 'var(--f-display)',
            fontSize: '1.5rem',
            transform: 'rotate(-3deg)',
          }}>M</div>
          <div>
            <div className="t-display" style={{ fontSize: '1.55rem', color: 'var(--cream)', lineHeight: 0.95 }}>
              {t('shell.brand')}
            </div>
            <div className="t-mono" style={{ fontSize: '0.7rem', color: 'var(--cream-dim)', letterSpacing: '0.06em' }}>
              {t('shell.brand.sub')}
            </div>
          </div>
        </div>
        <div className="t-kicker" style={{
          color: 'var(--acid)', fontSize: '0.78rem',
          padding: '4px 10px 3px',
          border: '1.5px solid var(--acid)',
          marginLeft: 4,
        }}>
          ● OPEN
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="t-mono" style={{ fontSize: '0.75rem', color: 'var(--cream-dim)' }}>
          [{t('shell.guest')}]
        </span>
        <button className="btn aberrate" style={{ fontSize: '0.85rem', padding: '11px 18px', minWidth: 0 }}>
          {t('shell.signin')}
        </button>
      </div>
    </header>
  );
}

function Breadcrumb() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 4px 22px',
      gap: 12, flexWrap: 'wrap',
    }}>
      <nav aria-label="Breadcrumb" className="t-kicker" style={{
        color: 'var(--cream-dim)', fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span className="aberrate" style={{ cursor: 'pointer' }}>{t('detail.kicker.browse')}</span>
        <span style={{ opacity: 0.4 }}>▸</span>
        <span className="aberrate" style={{ cursor: 'pointer' }}>{t('detail.kicker.anime')}</span>
        <span style={{ opacity: 0.4 }}>▸</span>
        <span style={{ color: 'var(--magenta)' }}>{t('detail.kicker.title')}</span>
      </nav>
      <div className="t-mono" style={{ fontSize: '0.72rem', color: 'var(--cream-dim)', letterSpacing: '0.05em' }}>
        {t('shell.aisle')} · {t('shell.brand.open')}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      maxWidth: 1200,
      margin: '64px auto 0',
      borderTop: '2px solid var(--ground-3)',
      paddingTop: 16,
      display: 'flex',
      justifyContent: 'space-between',
      gap: 14, flexWrap: 'wrap',
      color: 'var(--cream-dim)',
      fontFamily: 'var(--f-mono)',
      fontSize: '0.7rem',
      letterSpacing: '0.05em',
    }}>
      <span>© 1985–2026 {t('shell.brand')} · All tapes property of their respective rights-holders</span>
      <span>v1.4.0 · CRT TUBE OK · TRACKING NOMINAL</span>
    </footer>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
