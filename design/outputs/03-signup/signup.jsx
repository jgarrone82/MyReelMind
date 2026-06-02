// signup.jsx — Screen 03: Membership application card
// Memorable moment: the carbon-copy paper application form lifted off the counter.

function Signup() {
  const [tw, setTweak] = useTweaks(SIGNUP_DEFAULTS);
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [phase, setPhase] = React.useState('idle'); // idle | submitting | error | success
  const [glitchKey, setGlitchKey] = React.useState(0);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--scanline-opacity', tw.scanlines ? tw.scanlineOpacity : 0);
    document.documentElement.style.setProperty('--glow-mult', tw.glowMult);
    document.documentElement.style.setProperty('--grain-opacity', tw.grain);
  }, [tw]);

  React.useEffect(() => { setPhase(tw.formState); }, [tw.formState]);

  const didGlitch = React.useRef(false);
  React.useEffect(() => {
    if (tw.glitchOnLoad && !didGlitch.current) { didGlitch.current = true; setGlitchKey(k => k + 1); }
  }, []);

  // password strength 0..4
  const strength = React.useMemo(() => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) s++;
    if (/\d/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return pass.length === 0 ? 0 : Math.max(1, s);
  }, [pass]);

  const matches = confirm.length > 0 && confirm === pass;
  const mismatch = confirm.length > 0 && confirm !== pass;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailValid && pass.length >= 8 && matches;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) { setPhase('error'); setGlitchKey(k => k + 1); return; }
    setPhase('submitting');
    setTimeout(() => { setPhase('success'); setGlitchKey(k => k + 1); }, 1600);
  };

  const isSubmitting = phase === 'submitting';
  const isError = phase === 'error';
  const isSuccess = phase === 'success';

  return (
    <div className={`page ${tw.scanlines ? 'scanlines' : ''} ${tw.vignette ? 'crt' : ''}`}>
      {tw.grain > 0 && <div className="grain" />}
      {tw.wallpaper && <div className="shelf-wallpaper" aria-hidden />}

      <SignupHeader />

      <main style={{
        minHeight: 'calc(100vh - 90px)',
        display: 'grid', placeItems: 'center',
        padding: 'clamp(28px, 4vw, 56px) clamp(12px, 3vw, 40px) 220px',
        position: 'relative', zIndex: 1,
      }}>
        <div key={glitchKey} className={tw.glitchOnLoad ? 'glitch-once' : ''} style={{ width: 'min(460px, 100%)' }}>

          <div className="paper-card">
            <span className="paper-card__perf paper-card__perf--top" aria-hidden />
            <span className="paper-card__perf paper-card__perf--bot" aria-hidden />

            {/* Form number stamp */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '2px solid var(--ground)', paddingBottom: 10, marginBottom: 16,
              fontFamily: 'var(--f-mono)', fontSize: '0.62rem', letterSpacing: '0.08em',
              color: 'var(--ground)', opacity: 0.7,
            }}>
              <span>{t('signup.formno')}</span>
              <span style={{
                border: '1.5px solid var(--ground)', padding: '2px 6px',
                transform: 'rotate(2deg)', display: 'inline-block',
              }}>No. 0485</span>
            </div>

            {/* Title */}
            <h1 className="t-display aberrate" style={{
              margin: 0, color: 'var(--ground)', fontSize: 'clamp(1.7rem, 5vw, 2.35rem)', lineHeight: 1,
              textShadow: '-1.5px 0 0 var(--sodium), 1.5px 0 0 var(--phosphor)',
            }}>{t('signup.title')}</h1>
            <div style={{
              fontFamily: 'var(--f-marker)', color: 'var(--magenta)', fontSize: '1.15rem',
              transform: 'rotate(-1.5deg)', marginTop: 8, marginBottom: 18,
            }}>{t('signup.subtitle')}</div>

            {/* Banners */}
            {isError && (
              <div role="alert" style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: 'var(--error)', color: 'var(--cream)',
                border: '2px solid var(--ground)', boxShadow: '3px 3px 0 var(--ground)',
                padding: '10px 12px', marginBottom: 18,
              }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', lineHeight: 1 }}>⚠</span>
                <div>
                  <div className="t-kicker" style={{ fontSize: '0.78rem', letterSpacing: '0.16em' }}>{t('signup.error.head')}</div>
                  <div className="t-mono" style={{ fontSize: '0.78rem', lineHeight: 1.4, marginTop: 2 }}>{t('signup.error.body')}</div>
                </div>
              </div>
            )}
            {isSuccess && (
              <div role="status" style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: 'var(--acid)', color: 'var(--ground)',
                border: '2px solid var(--ground)', boxShadow: '3px 3px 0 var(--ground)',
                padding: '10px 12px', marginBottom: 18,
              }}>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', lineHeight: 1 }}>✓</span>
                <div>
                  <div className="t-kicker" style={{ fontSize: '0.78rem', letterSpacing: '0.16em' }}>{t('signup.success.head')}</div>
                  <div className="t-mono" style={{ fontSize: '0.78rem', lineHeight: 1.4, marginTop: 2 }}>{t('signup.success.body')}</div>
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div className="paper-field">
                <label className="paper-label" htmlFor="email">
                  <span>{t('signup.label.email')}</span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.58rem', opacity: 0.55 }}>REQ</span>
                </label>
                <input id="email" type="email" autoComplete="email"
                  className={`paper-input ${email.length > 0 ? (emailValid ? 'paper-input--ok' : 'paper-input--bad') : ''}`}
                  placeholder={t('signup.ph.email')}
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
              </div>

              {/* Password + strength */}
              <div className="paper-field">
                <label className="paper-label" htmlFor="password">
                  <span>{t('signup.label.password')}</span>
                  <button type="button" onClick={() => setShow(s => !s)}
                    style={{ appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                      fontFamily: 'var(--f-kicker)', fontSize: '0.68rem', letterSpacing: '0.14em',
                      color: 'var(--magenta)', padding: 0 }}>
                    {show ? t('signup.hide') : t('signup.show')}
                  </button>
                </label>
                <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password"
                  className="paper-input"
                  placeholder={t('signup.ph.password')}
                  value={pass} onChange={(e) => setPass(e.target.value)} disabled={isSubmitting} />
                {/* dot-matrix strength meter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <div className="strength-dots" aria-hidden>
                    {[0,1,2,3].map(i => <i key={i} className={i < strength ? 'on' : ''} />)}
                  </div>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: 'var(--ground)', opacity: 0.75 }}>
                    {t(`signup.strength.${strength}`)}
                  </span>
                </div>
              </div>

              {/* Confirm */}
              <div className="paper-field">
                <label className="paper-label" htmlFor="confirm">
                  <span>{t('signup.label.confirm')}</span>
                  {confirm.length > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontFamily: 'var(--f-mono)', fontSize: '0.66rem',
                      color: matches ? '#1f7a3d' : 'var(--magenta)',
                    }}>
                      <span style={{
                        width: 16, height: 16, display: 'grid', placeItems: 'center',
                        border: `1.5px solid ${matches ? '#1f7a3d' : 'var(--magenta)'}`,
                        color: matches ? '#1f7a3d' : 'var(--magenta)', fontSize: '0.7rem', lineHeight: 1,
                      }}>{matches ? '✓' : '✕'}</span>
                      {matches ? t('signup.match.ok') : t('signup.match.no')}
                    </span>
                  )}
                </label>
                <input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password"
                  className={`paper-input ${matches ? 'paper-input--ok' : mismatch ? 'paper-input--bad' : ''}`}
                  placeholder={t('signup.ph.confirm')}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={isSubmitting} />
              </div>

              {/* CTA */}
              <button type="submit" disabled={isSubmitting}
                className="aberrate"
                style={{
                  appearance: 'none', cursor: isSubmitting ? 'wait' : 'pointer',
                  fontFamily: 'var(--f-kicker)', textTransform: 'uppercase', letterSpacing: '0.16em',
                  fontSize: '1.15rem', color: 'var(--cream)',
                  background: 'var(--magenta)', border: '2px solid var(--ground)',
                  boxShadow: '3px 3px 0 var(--sodium)', borderRadius: 2,
                  padding: '15px 22px', marginTop: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: isSubmitting ? 0.85 : 1, transition: 'transform 90ms, box-shadow 90ms',
                }}
                onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = '4px 5px 0 var(--sodium)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0,0)'; e.currentTarget.style.boxShadow = '3px 3px 0 var(--sodium)'; }}
              >
                {isSubmitting && <span className="spinner-reel" />}
                {isSubmitting ? t('signup.cta.loading') : t('signup.cta')}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
              <span style={{ flex: 1, height: 2, background: 'rgba(10,8,7,0.3)' }} />
              <span className="t-kicker" style={{ color: 'var(--ground)', opacity: 0.7, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{t('signup.divider')}</span>
              <span style={{ flex: 1, height: 2, background: 'rgba(10,8,7,0.3)' }} />
            </div>

            {/* OAuth rental cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button type="button" className="oauth-card" style={{ transform: 'rotate(-1.5deg)' }}>
                <GoogleMark />
                <span className="label-grow">{t('signup.oauth.google')}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', opacity: 0.6 }}>OAUTH</span>
              </button>
              <button type="button" className="oauth-card" style={{ transform: 'rotate(1.5deg)' }}>
                <GitHubMark />
                <span className="label-grow">{t('signup.oauth.github')}</span>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', opacity: 0.6 }}>OAUTH</span>
              </button>
            </div>

            {/* Clerk line */}
            <div className="t-mono" style={{
              borderTop: '2px dashed rgba(10,8,7,0.35)', marginTop: 20, paddingTop: 12,
              fontSize: '0.62rem', color: 'var(--ground)', opacity: 0.6, letterSpacing: '0.06em',
            }}>{t('signup.clerk')}</div>
          </div>

          {/* Already a member */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span className="t-kicker" style={{ color: 'var(--acid)', fontSize: '0.92rem' }}>
              {t('signup.already')}{' '}
              <a href="login.html" style={{
                color: 'var(--acid)', textDecorationColor: 'var(--acid)', textUnderlineOffset: 3,
              }}>→ {t('signup.signin')}</a>
            </span>
          </div>

          <div className="t-mono" style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--cream-dim)', opacity: 0.5, marginTop: 14, lineHeight: 1.5, maxWidth: 380, marginInline: 'auto' }}>
            {t('signup.legal')}
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
          options={[{ value: 'idle', label: 'Idle' }, { value: 'submitting', label: 'Submit' }, { value: 'error', label: 'Error' }, { value: 'success', label: 'Done' }]}
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

const SIGNUP_DEFAULTS = /*EDITMODE-BEGIN*/{
  "formState": "idle",
  "wallpaper": true,
  "scanlines": true,
  "scanlineOpacity": 0.18,
  "vignette": true,
  "grain": 0.05,
  "glowMult": 1.0,
  "glitchOnLoad": true
}/*EDITMODE-END*/;

function SignupHeader() {
  return (
    <header data-screen-label="Signup · Header" style={{
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="t-kicker" style={{
          color: 'var(--acid)', fontSize: '0.78rem', padding: '4px 10px 3px', border: '1.5px solid var(--acid)',
        }}>● OPEN</div>
        <a href="login.html" className="btn aberrate" style={{ fontSize: '0.85rem', padding: '11px 18px', minWidth: 0, textDecoration: 'none' }}>
          {t('shell.signin')}
        </a>
      </div>
    </header>
  );
}

const signupRoot = ReactDOM.createRoot(document.getElementById('root'));
signupRoot.render(<Signup />);
