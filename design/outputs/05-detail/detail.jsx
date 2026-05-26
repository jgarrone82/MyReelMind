// detail.jsx — Unfolded VHS Cover detail page (anonymous state)

function UnfoldedVHS() {
  return (
    <div className="unfolded-vhs" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.65fr) 64px minmax(0, 1fr)',
      maxWidth: 1200,
      margin: '0 auto',
      background: 'var(--paper)',
      color: 'var(--ground)',
      border: '2px solid var(--ground)',
      boxShadow: '12px 12px 0 rgba(0,0,0,0.7)',
      transform: 'rotate(-0.4deg)',
      position: 'relative',
      backgroundImage:
        'radial-gradient(ellipse at 30% 20%, rgba(255,138,61,0.08), transparent 60%),' +
        'radial-gradient(ellipse at 80% 80%, rgba(74,255,240,0.05), transparent 65%)',
    }}>
      {/* Wear marks */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.15 0 0 0 0 0.1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        mixBlendMode: 'multiply',
        opacity: 0.4,
      }} />

      <BackCover />
      <Spine />
      <FrontCover />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRONT COVER (right)
// ─────────────────────────────────────────────────────────────────────────────

function FrontCover() {
  return (
    <div style={{
      borderLeft: '1px dashed rgba(10,8,7,0.35)',
      padding: 0,
      position: 'relative',
      background: 'var(--ground)',
    }}>
      <PosterPlaceholder
        title={t('detail.title')}
        subtitle={t('detail.stickers.anime')}
        hue="magenta"
        motif="circle"
        catalog="MRM-04421-A"
      />
      {/* "NEW ARRIVAL" sticker */}
      <span className="sticker sticker--acid sticker--r3"
        style={{ position: 'absolute', top: 12, left: -10, zIndex: 3, fontSize: '0.78rem' }}>
        ★ {t('detail.stickers.new')}
      </span>
      {/* Rating sticker */}
      <span className="sticker sticker--ground sticker--r1"
        style={{ position: 'absolute', bottom: -8, right: 12, zIndex: 3, fontSize: '0.8rem' }}>
        Rated {t('detail.rating')}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPINE (middle)
// ─────────────────────────────────────────────────────────────────────────────

function Spine() {
  return (
    <div style={{
      background: 'var(--ground-2)',
      color: 'var(--cream)',
      borderLeft: '1px dashed rgba(10,8,7,0.35)',
      borderRight: '1px dashed rgba(10,8,7,0.35)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 4px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top: faux logo + catalog */}
      <div style={{
        fontFamily: 'var(--f-kicker)',
        fontSize: '0.55rem',
        letterSpacing: '0.18em',
        color: 'var(--magenta)',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        <div style={{
          width: 28, height: 28,
          margin: '0 auto 6px',
          background: 'var(--magenta)',
          color: 'var(--cream)',
          fontFamily: 'var(--f-display)',
          fontSize: '1rem',
          display: 'grid', placeItems: 'center',
          border: '1.5px solid var(--cream-dim)',
        }}>M</div>
        MRM<br/>04421
      </div>

      {/* Title vertical (rotated -90deg, reads bottom-to-top) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        width: '100%',
      }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: '2.1rem',
          letterSpacing: '-0.02em',
          color: 'var(--cream)',
          textShadow: '2px 2px 0 var(--magenta)',
          transform: 'rotate(-90deg)',
          transformOrigin: 'center',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>{t('detail.title')}</div>
      </div>

      {/* Bottom: year */}
      <div style={{
        fontFamily: 'var(--f-mono)',
        fontSize: '0.7rem',
        color: 'var(--cream-dim)',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: '0.06em',
      }}>
        {t('detail.year')}<br/>
        <span style={{ fontSize: '0.55rem', opacity: 0.7 }}>VHS</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BACK COVER (left, widest)
// ─────────────────────────────────────────────────────────────────────────────

function BackCover() {
  return (
    <div style={{
      padding: '24px 28px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      position: 'relative',
    }}>
      {/* Header: Studio + source */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '2px solid var(--ground)',
        paddingBottom: 10,
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div className="t-kicker" style={{ color: 'var(--ground)', opacity: 0.55, fontSize: '0.7rem' }}>
            {t('detail.studio')}
          </div>
          <div className="t-display" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: 'var(--ground)', marginTop: 2 }}>
            {t('detail.title')}
          </div>
          <div className="t-mono" style={{ fontSize: '0.85rem', color: 'var(--ground)', opacity: 0.7 }}>
            {t('detail.original')} · {t('detail.basedon')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <SourceBadge label={t('detail.source.tmdb')} color="magenta" />
          <SourceBadge label={t('detail.source.anilist')} color="phosphor" />
          <SourceBadge label={t('detail.source.imdb')} color="acid" />
        </div>
      </div>

      {/* Stickers */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, paddingTop: 4 }}>
        <span className="sticker sticker--magenta sticker--r1">{t('detail.stickers.anime')}</span>
        <span className="sticker sticker--phosphor sticker--r2">{t('detail.stickers.cyberpunk')}</span>
        <span className="sticker sticker--cream sticker--r3">{t('detail.stickers.classic')}</span>
        <span className="sticker sticker--sodium sticker--r1">{t('detail.stickers.import')}</span>
        <span className="sticker sticker--cream sticker--r2">{t('detail.stickers.dubbed')}</span>
      </div>

      {/* Tagline */}
      <div className="t-display"
        style={{
          fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)',
          color: 'var(--ground)',
          lineHeight: 1.05,
          fontStyle: 'italic',
          textWrap: 'pretty',
        }}>
        “{t('detail.tagline')}”
      </div>

      {/* Synopsis label */}
      <div className="t-kicker" style={{
        color: 'var(--ground)',
        fontSize: '0.78rem',
        borderTop: '2px solid var(--ground)',
        paddingTop: 8,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>{t('detail.synopsis.head')}</span>
        <span style={{ opacity: 0.6 }}>Side A · Track 1</span>
      </div>

      <div className="t-mono" style={{
        color: 'var(--ground)',
        fontSize: '0.95rem',
        lineHeight: 1.55,
        textWrap: 'pretty',
        columns: '2',
        columnGap: 28,
        columnRule: '1px dashed rgba(10,8,7,0.3)',
      }}>
        <p style={{ margin: '0 0 12px', breakInside: 'avoid' }}>{t('detail.synopsis.body')}</p>
        <p style={{ margin: 0, breakInside: 'avoid' }}>{t('detail.synopsis.body2')}</p>
      </div>

      {/* Marker annotation */}
      <div style={{ position: 'relative', marginTop: -4 }}>
        <span style={{
          fontFamily: 'var(--f-marker)',
          color: 'var(--magenta)',
          fontSize: '1.25rem',
          transform: 'rotate(-3deg)',
          display: 'inline-block',
          textShadow: '0 0 1px rgba(255,46,110,0.4)',
        }}>★ Be kind, rewind.</span>
      </div>

      {/* Cast + specs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.2fr)',
        gap: 18,
        borderTop: '2px solid var(--ground)',
        paddingTop: 14,
      }}>
        {/* Cast */}
        <div>
          <div className="t-kicker" style={{ color: 'var(--ground)', fontSize: '0.78rem', marginBottom: 8 }}>
            {t('detail.cast.head')}
          </div>
          <ul className="t-mono" style={{
            margin: 0, padding: 0, listStyle: 'none',
            fontSize: '0.85rem', color: 'var(--ground)',
            display: 'flex', flexDirection: 'column', gap: 3,
          }}>
            <li>· {t('detail.cast.1')}</li>
            <li>· {t('detail.cast.2')}</li>
            <li>· {t('detail.cast.3')}</li>
            <li>· {t('detail.cast.4')}</li>
            <li>· {t('detail.cast.5')}</li>
          </ul>
          <div className="t-mono" style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--ground)', opacity: 0.8 }}>
            <span style={{ display: 'block', fontFamily: 'var(--f-kicker)', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: '0.72rem' }}>Directed by</span>
            {t('detail.director')}
          </div>
        </div>

        {/* Tape specs */}
        <div>
          <div className="t-kicker" style={{ color: 'var(--ground)', fontSize: '0.78rem', marginBottom: 8 }}>
            {t('detail.specs.head')}
          </div>
          <SpecsTable />
        </div>
      </div>

      {/* Bottom row: FBI warning + barcode */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.6fr) minmax(180px,1fr)',
        gap: 18,
        borderTop: '2px solid var(--ground)',
        paddingTop: 14,
      }}>
        <div>
          <div className="t-kicker" style={{ color: 'var(--error)', fontSize: '0.72rem', marginBottom: 6 }}>
            ⚠ {t('detail.warning.head')}
          </div>
          <p className="t-mono" style={{
            margin: 0, fontSize: '0.62rem', color: 'var(--ground)',
            lineHeight: 1.45, opacity: 0.85,
          }}>{t('detail.warning.body')}</p>
        </div>
        <div>
          <Barcode seed="AKIRA1988" />
          <div className="t-mono" style={{
            fontSize: '0.7rem', color: 'var(--ground)', textAlign: 'center',
            letterSpacing: '0.18em', marginTop: 4,
          }}>{t('detail.specs.upc_v')}</div>
        </div>
      </div>
    </div>
  );
}

function SpecsTable() {
  const rows = [
    ['detail.specs.cat',   'detail.specs.cat_v'],
    ['detail.specs.run',   'detail.specs.run_v'],
    ['detail.specs.tape',  'detail.specs.tape_v'],
    ['detail.specs.audio', 'detail.specs.audio_v'],
    ['detail.specs.color', 'detail.specs.color_v'],
  ];
  return (
    <div style={{
      background: 'var(--paper-2)',
      border: '1.5px solid var(--ground)',
      padding: '8px 10px',
      fontFamily: 'var(--f-mono)',
      fontSize: '0.78rem',
    }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between',
          borderBottom: '1px dashed rgba(10,8,7,0.3)',
          padding: '3px 0',
        }}>
          <span style={{ opacity: 0.7 }}>{t(k)}</span>
          <span style={{ fontWeight: 600 }}>{t(v)}</span>
        </div>
      ))}
    </div>
  );
}

function SourceBadge({ label, color = 'magenta' }) {
  const bg = {
    magenta:  'var(--magenta)',
    phosphor: 'var(--phosphor)',
    acid:     'var(--acid)',
    sodium:   'var(--sodium)',
  }[color];
  return (
    <span style={{
      fontFamily: 'var(--f-mono)',
      fontSize: '0.65rem',
      letterSpacing: '0.08em',
      color: 'var(--ground)',
      background: bg,
      border: '1.5px solid var(--ground)',
      padding: '3px 8px 2px',
      boxShadow: '2px 2px 0 var(--ground)',
      whiteSpace: 'nowrap',
      fontWeight: 600,
    }}>{label}</span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Members Only CTA (anonymous state)
// ─────────────────────────────────────────────────────────────────────────────

function MembersOnlyPanel() {
  return (
    <section style={{
      maxWidth: 1200,
      margin: '40px auto 0',
      display: 'grid',
      gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)',
      gap: 0,
      background: 'var(--ground-2)',
      border: '2px solid var(--ground)',
      boxShadow: '8px 8px 0 rgba(0,0,0,0.85)',
      position: 'relative',
    }}>
      {/* Big stamp */}
      <div style={{
        background: 'var(--ground-3)',
        borderRight: '2px solid var(--ground)',
        padding: '28px 22px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stamped circle */}
        <div style={{
          width: 168, height: 168,
          border: '4px solid var(--error)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          color: 'var(--error)',
          transform: 'rotate(-8deg)',
          textShadow: '1px 1px 0 rgba(0,0,0,0.5)',
          padding: 12, textAlign: 'center',
          boxShadow: 'inset 0 0 0 2px var(--error)',
        }}>
          <div style={{
            fontFamily: 'var(--f-kicker)',
            fontSize: '1.1rem', letterSpacing: '0.18em',
            lineHeight: 1, marginBottom: 4,
          }}>MEMBERS</div>
          <div style={{
            fontFamily: 'var(--f-display)',
            fontSize: '1.7rem', lineHeight: 0.9,
          }}>ONLY</div>
          <div style={{
            fontFamily: 'var(--f-mono)',
            fontSize: '0.55rem', letterSpacing: '0.18em',
            marginTop: 4, opacity: 0.85,
          }}>SECTION · 04</div>
        </div>
      </div>

      {/* Copy + actions */}
      <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="t-kicker" style={{
          color: 'var(--acid)', fontSize: '0.78rem',
        }}>{t('detail.cta.kicker')}</div>

        <h2 className="t-display"
          style={{ margin: 0, color: 'var(--cream)', fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)' }}>
          {t('detail.cta.head')}
        </h2>

        <p style={{
          margin: 0,
          color: 'var(--cream-dim)',
          fontFamily: 'var(--f-mono)',
          fontSize: '0.92rem',
          lineHeight: 1.55,
          textWrap: 'pretty',
          maxWidth: 540,
        }}>{t('detail.cta.body')}</p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4, alignItems: 'center' }}>
          <button className="btn aberrate">{t('detail.cta.primary')}</button>
          <button className="btn btn--secondary">{t('detail.cta.secondary')}</button>
        </div>

        <div style={{
          marginTop: 6,
          fontFamily: 'var(--f-marker)',
          color: 'var(--sodium)',
          fontSize: '1.05rem',
          transform: 'rotate(-1deg)',
          display: 'inline-block',
        }}>{t('detail.cta.tertiary')}</div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Related shelf
// ─────────────────────────────────────────────────────────────────────────────

function RelatedShelf() {
  const items = [
    { title: t('related.1.title'), year: t('related.1.year'), hue: 'magenta',  motif: 'spool',      cat: 'MRM-00128-B', badge: t('detail.stickers.staff'), badgeColor: 'acid' },
    { title: t('related.2.title'), year: t('related.2.year'), hue: 'phosphor', motif: 'mesh',       cat: 'MRM-00930-A' },
    { title: t('related.3.title'), year: t('related.3.year'), hue: 'sodium',   motif: 'triangle',   cat: 'MRM-00451-C' },
    { title: t('related.4.title'), year: t('related.4.year'), hue: 'acid',     motif: 'grid',       cat: 'MRM-00712-A', badge: t('detail.stickers.new'), badgeColor: 'magenta' },
    { title: t('related.5.title'), year: t('related.5.year'), hue: 'cream',    motif: 'spool',      cat: 'MRM-00188-A' },
    { title: t('related.6.title'), year: t('related.6.year'), hue: 'phosphor', motif: 'mesh',       cat: 'MRM-01093-B' },
  ];
  return (
    <section style={{
      maxWidth: 1200,
      margin: '48px auto 0',
      padding: '0 4px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        borderBottom: '3px double var(--cream-dim)',
        paddingBottom: 8, marginBottom: 22, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span className="t-kicker" style={{
            color: 'var(--acid)', fontSize: '1.05rem',
            textShadow: '0 0 12px rgba(214,255,62,0.4)',
          }}>{t('detail.related.head')}</span>
          <span style={{
            fontFamily: 'var(--f-marker)',
            color: 'var(--sodium)', fontSize: '1rem',
            transform: 'rotate(-2deg)', display: 'inline-block',
          }}>{t('detail.related.note')}</span>
        </div>
        <button className="btn btn--ghost aberrate">{t('detail.related.action')} →</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 22,
      }}>
        {items.map((it, i) => (
          <VHSBoxCard
            key={i}
            title={it.title}
            year={it.year}
            hue={it.hue}
            motif={it.motif}
            catalog={it.cat}
            badge={it.badge}
            badgeColor={it.badgeColor}
          />
        ))}
      </div>
    </section>
  );
}

Object.assign(window, {
  UnfoldedVHS, MembersOnlyPanel, RelatedShelf,
});
