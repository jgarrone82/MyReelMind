// login.jsx — Screen 02: Membership sign-in desk
// Memorable moment: the CRT display frame wrapping the form.

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
function GitHubMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path fill="#0a0807" d="M12 1C5.92 1 1 5.92 1 12c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53v-1.86c-3.06.67-3.7-1.47-3.7-1.47-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.69-1.47-2.44-.28-5.01-1.22-5.01-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.03 5.42.4.34.74 1 .74 2.02v3c0 .3.2.64.76.53A11 11 0 0 0 23 12c0-6.08-4.92-11-11-11z"/>
    </svg>
  );
}

function Login() {
  const [tw, setTweak] = useTweaks(LOGIN_DEFAULTS);
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [phase, setPhase] = React.useState('idle'); // idle | loading | error
  const [glitchKey, setGlitchKey] = React.useState(0);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', tw.scanlines ? tw.scanlineOpacity : 0);
    document.documentElement.style.setProperty('--glow-mult', tw.glowMult);
    document.documentElement.style.setProperty('--grain-opacity', tw.grain);
  }, [tw]);

  // Mirror the Tweak-driven state into local phase (so designers can preview)
  React.useEffect(() => { setPhase(tw.formState); }, [tw.formState]);

  const didGlitch = React.useRef(false);
  React.useEffect(() => {
    if (tw.glitchOnLoad && !didGlitch.current) { didGlitch.current = true; setGlitchKey(k => k + 1); }
  }, []);

  const valid = /\S+@\S+\.\S+/.test(email) && pass.length >= 1;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!valid) { setPhase('error'); setGlitchKey(k => k + 1); return; }
    setPhase('loading');
    setTimeout(() => { setPhase('error'); setGlitchKey(k => k + 1); }, 1600); // demo: ends in error banner
  };

  const isError = phase === 'error';
  const isLoading = phase === 'loading';

  return (
    <div className={`page ${tw.scanlines ? 'scanlines' : ''} ${tw.vignette ? 'crt' : ''}`}>
      {tw.grain > 0 && <div className="grain" />}
      {tw.wallpaper && <div className="shelf-wallpaper" aria-hidden />}

      <LoginHeader />

      <main style={{
        minHeight: 'calc(100vh - 90px)',
        display: 'grid', placeItems: 'center',
        padding: 'clamp(24px, 4vw, 48px) clamp(12px, 3vw, 40px) 220px',
        position: 'relative', zIndex: 1,
      }}>
        <div key={glitchKey} className={tw.glitchOnLoad ? 'glitch-once' : ''} style={{ width: 'min(440px, 100%)' }}>

          {/* Kicker + title outside the screen */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span className="sticker sticker--sodium sticker--r1" style={{ fontSize: '0.72rem' }}>
              {t('login.kicker')}
            </span>
          </div>

          {/* The CRT display frame — memorable moment */}
          <div className="crt-frame">
            <span className="crt-frame__screw" style={{ top: 8, left: 8 }} />
            <span className="crt-frame__screw" style={{ top: 8, right: 8 }} />
            <span className="crt-frame__screw" style={{ bottom: 8, left: 8 }} />
            <span className="crt-frame__screw" style={{ bottom: 8, right: 8 }} />

            <div className="crt-frame__screen">
              <span className="crt-frame__led" title="power" />

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h1 className="t-display aberrate" style={{
                  margin: 0, color: 'var(--cream)', fontSize: 'clamp(1.7rem, 5vw, 2.3rem)',
                  textShadow: '-1.5px 0 0 var(--magenta), 1.5px 0 0 var(--phosphor), 2px 2px 0 var(--ground)',
                }}>{t('login.title')}</h1>
                <div className="t-mono" style={{ fontSize: '0.72rem', color: 'var(--phosphor)', letterSpacing: '0.14em', marginTop: 6 }}>
                  ▸ {t('login.subtitle')}
                </div>
              </div>

              {/* Error banner */}
              {isError && (
                <div role="alert" style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  background: 'var(--error)', color: 'var(--cream)',
                  border: '2px solid var(--ground)', boxShadow: '3px 3px 0 var(--ground)',
                  padding: '10px 12px', marginBottom: 18,
                }}>
                  <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', lineHeight: 1 }}>⚠</span>
                  <div>
                    <div className="t-kicker" style={{ fontSize: '0.78rem', letterSpacing: '0.16em' }}>{t('login.error.head')}</div>
                    <div className="t-mono" style={{ fontSize: '0.78rem', lineHeight: 1.4, marginTop: 2 }}>{t('login.error.body')}</div>
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div className="cassette-field">
                  <label className="cassette-label" htmlFor="email">
                    <span>{t('login.label.email')}</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', opacity: 0.6, letterSpacing: '0.1em' }}>REQ</span>
                  </label>
                  <input id="email" type="email" autoComplete="email"
                    className={`cassette-input ${isError ? 'cassette-input--error' : ''}`}
                    placeholder={t('login.ph.email')}
                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                </div>

                {/* Password */}
                <div className="cassette-field">
                  <label className="cassette-label" htmlFor="password">
                    <span>{t('login.label.password')}</span>
                    <button type="button" onClick={() => setShow(s => !s)}
                      style={{
                        appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                        fontFamily: 'var(--f-kicker)', fontSize: '0.7rem', letterSpacing: '0.14em',
                        color: 'var(--phosphor)', padding: 0,
                      }}>
                      {show ? t('login.hide') : t('login.show')}
                    </button>
                  </label>
                  <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
                    className={`cassette-input ${isError ? 'cassette-input--error' : ''}`}
                    placeholder={t('login.ph.password')}
                    value={pass} onChange={(e) => setPass(e.target.value)} disabled={isLoading} />
                </div>

                {/* Forgot */}
                <div style={{ textAlign: 'right', marginTop: -6 }}>
                  <a href="#" style={{
                    fontFamily: 'var(--f-mono)', fontStyle: 'italic', fontSize: '0.78rem',
                    color: 'var(--cream-dim)', textDecorationColor: 'var(--cream-dim)',
                  }}>{t('login.forgot')}</a>
                </div>

                {/* Primary CTA — magenta fill, sodium offset */}
                <button type="submit" disabled={isLoading}
                  className="aberrate"
                  style={{
                    appearance: 'none', cursor: isLoading ? 'wait' : 'pointer',
                    fontFamily: 'var(--f-kicker)', textTransform: 'uppercase', letterSpacing: '0.16em',
                    fontSize: '1.1rem', color: 'var(--cream)',
                    background: 'var(--magenta)', border: '2px solid var(--ground)',
                    boxShadow: '3px 3px 0 var(--sodium)', borderRadius: 2,
                    padding: '14px 22px', marginTop: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    opacity: isLoading ? 0.85 : 1,
                    transition: 'transform 90ms, box-shadow 90ms',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '4px 5px 0 var(--sodium)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--sodium)'; }}
                >
                  {isLoading && <span className="spinner-reel" />}
                  {isLoading ? t('login.cta.loading') : t('login.cta')}
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
                <span style={{ flex: 1, height: 2, background: 'var(--ground-4)' }} />
                <span className="t-kicker" style={{ color: 'var(--cream-dim)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{t('login.divider')}</span>
                <span style={{ flex: 1, height: 2, background: 'var(--ground-4)' }} />
              </div>

              {/* OAuth rental cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button type="button" className="oauth-card" style={{ transform: 'rotate(-1.5deg)' }}>
                  <GoogleMark />
                  <span className="label-grow">{t('login.oauth.google')}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', opacity: 0.6 }}>OAUTH</span>
                </button>
                <button type="button" className="oauth-card" style={{ transform: 'rotate(1.5deg)' }}>
                  <GitHubMark />
                  <span className="label-grow">{t('login.oauth.github')}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', opacity: 0.6 }}>OAUTH</span>
                </button>
              </div>

              <div className="t-mono" style={{
                textAlign: 'center', fontSize: '0.6rem', color: 'var(--cream-dim)',
                opacity: 0.55, letterSpacing: '0.12em', marginTop: 18,
              }}>{t('login.terminal')}</div>
            </div>
          </div>

          {/* Create account — framed acid-green link */}
          <a href="#" style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            marginTop: 18, border: '2px dashed var(--acid)', background: 'rgba(214,255,62,0.04)',
            padding: '14px 18px',
            fontFamily: 'var(--f-kicker)', textTransform: 'uppercase', letterSpacing: '0.14em',
            color: 'var(--acid)', fontSize: '0.95rem',
            transition: 'background 120ms, box-shadow 120ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(214,255,62,0.1)'; e.currentTarget.style.boxShadow = '0 0 18px rgba(214,255,62,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(214,255,62,0.04)'; e.currentTarget.style.boxShadow = 'none'; }}
          >{t('login.signup')} →</a>

          <div className="t-mono" style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--cream-dim)', opacity: 0.5, marginTop: 14, lineHeight: 1.5 }}>
            {t('login.legal')}
          </div>
        </div>
      </main>

      <TabBar active="account" onChange={(id) => {
        if (id === 'home') window.location.href = 'dashboard.html';
        else if (id === 'browse' || id === 'rent') window.location.href = 'index.html';
        else setGlitchKey(k => k + 1);
      }} />

      <TweaksPanel title="Tweaks · CRT controls">
        <TweakSection label="Form state" />
        <TweakRadio value={tw.formState}
          options={[{ value: 'idle', label: 'Idle' }, { value: 'loading', label: 'Loading' }, { value: 'error', label: 'Error' }]}
          onChange={(v) => setTweak('formState', v)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="Shelf wallpaper" value={tw.wallpaper} onChange={(v) => setTweak('wallpaper', v)} />
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

const LOGIN_DEFAULTS = /*EDITMODE-BEGIN*/{
  "formState": "idle",
  "wallpaper": true,
  "scanlines": true,
  "scanlineOpacity": 0.18,
  "vignette": true,
  "grain": 0.05,
  "glowMult": 1.0,
  "glitchOnLoad": true
}/*EDITMODE-END*/;

function LoginHeader() {
  return (
    <header data-screen-label="Login · Header" style={{
      borderBottom: '2px solid var(--phosphor)',
      boxShadow: '0 2px 0 var(--ground-3), 0 3px 18px rgba(74,255,240,0.12)',
      padding: '14px clamp(12px, 3vw, 40px)',
      display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16,
      maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 2,
    }}>
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
        color: 'var(--acid)', fontSize: '0.78rem', padding: '4px 10px 3px', border: '1.5px solid var(--acid)',
      }}>● OPEN</div>
    </header>
  );
}

const loginRoot = ReactDOM.createRoot(document.getElementById('root'));
loginRoot.render(<Login />);
