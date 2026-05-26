// onboarding.jsx — Encuesta inicial tras registro
const { useState: useStateOB, useEffect: useEffectOB } = React;

const ACTIVITIES = [
  { id: 'run', label: 'Running', icon: 'run', color: '#FF6E3D' },
  { id: 'bike', label: 'Ciclismo', icon: 'bike', color: '#5DC9F2' },
  { id: 'trail', label: 'Trail', icon: 'trail', color: '#C6FF3D' },
  { id: 'mtb', label: 'MTB', icon: 'mtb', color: '#FFB31A' },
];

const LEVELS_EXP = [
  { id: 'rookie', label: 'Principiante', sub: 'Empiezo ahora · 0-15 km/sem', color: '#9AA0AB' },
  { id: 'medio', label: 'Intermedio', sub: 'Salgo a menudo · 15-40 km/sem', color: '#C6FF3D' },
  { id: 'avanzado', label: 'Avanzado', sub: 'Entreno con plan · 40-80 km/sem', color: '#FFB31A' },
  { id: 'pro', label: 'Competidor', sub: 'Carreras · +80 km/sem', color: '#FF4D1A' },
];

const TIMES = [
  { id: 'amanecer', label: 'Madrugada', sub: '05:00 – 08:00', icon: 'sunrise' },
  { id: 'mañana', label: 'Mañana', sub: '08:00 – 12:00', icon: 'weather' },
  { id: 'tarde', label: 'Tarde', sub: '12:00 – 19:00', icon: 'compass' },
  { id: 'noche', label: 'Noche', sub: '19:00 – 23:00', icon: 'moon' },
];

const GOALS = [
  { id: 'forma', label: 'Mantener forma', icon: 'bolt' },
  { id: 'perder', label: 'Perder peso', icon: 'flag' },
  { id: 'carrera', label: 'Preparar carrera', icon: 'trophy' },
  { id: 'disfrute', label: 'Disfrutar y explorar', icon: 'compass' },
];

function OnboardingScreen({ user, onDone }) {
  const I = window.Icon;
  const [step, setStep] = useStateOB(0);
  const [city, setCity] = useStateOB('');
  const [cityCoords, setCityCoords] = useStateOB(null);
  const [cityResults, setCityResults] = useStateOB([]);
  const [searching, setSearching] = useStateOB(false);
  const [activity, setActivity] = useStateOB(null);
  const [level, setLevel] = useStateOB(null);
  const [weeklyKm, setWeeklyKm] = useStateOB(25);
  const [goal, setGoal] = useStateOB(null);
  const [preferredTime, setPreferredTime] = useStateOB(null);
  const [joinCommunity, setJoinCommunity] = useStateOB(true);
  const [notifications, setNotifications] = useStateOB(true);

  const STEPS = [
    { id: 'city', title: '¿De dónde eres?', sub: 'Para sugerirte rutas y comunidad local' },
    { id: 'activity', title: '¿Tu deporte favorito?', sub: 'Podrás cambiarlo más tarde' },
    { id: 'level', title: '¿Tu nivel actual?', sub: 'Para ajustar dificultad y planes' },
    { id: 'goal', title: '¿Qué buscas en Akktivate?', sub: 'Tu motivación principal' },
    { id: 'weekly', title: 'Objetivo semanal', sub: 'Kilómetros que quieres cubrir' },
    { id: 'time', title: '¿Cuándo entrenas?', sub: 'Para enviarte recordatorios útiles' },
    { id: 'community', title: 'Únete a la manada', sub: 'Ranking local, kudos, retos' },
  ];

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Forward geocoding (debounced) for city step
  useEffectOB(() => {
    if (step !== 0) return;
    if (!city.trim() || city.trim().length < 3) { setCityResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await window.AKK_TOOLS.forwardGeocode(city);
        setCityResults(res);
      } catch (e) { setCityResults([]); }
      finally { setSearching(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [city, step]);

  function pickCity(r) {
    setCity(r.label);
    setCityCoords({ lat: r.lat, lng: r.lng });
    setCityResults([]);
  }

  function canAdvance() {
    if (cur.id === 'city') return !!cityCoords;
    if (cur.id === 'activity') return !!activity;
    if (cur.id === 'level') return !!level;
    if (cur.id === 'goal') return !!goal;
    if (cur.id === 'weekly') return weeklyKm > 0;
    if (cur.id === 'time') return !!preferredTime;
    return true;
  }

  function finish() {
    onDone({
      city, cityCoords, activity, level, weeklyKm, goal, preferredTime, joinCommunity, notifications,
    });
  }

  function next() {
    if (isLast) return finish();
    if (canAdvance()) setStep(s => s + 1);
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,77,26,0.18), transparent 60%)',
        pointerEvents: 'none',
      }}/>

      {/* Top progress bar */}
      <div style={{ position: 'relative', padding: '64px 24px 0' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i <= step ? 'var(--orange)' : 'rgba(255,255,255,0.08)',
              transition: 'background 240ms',
            }}/>
          ))}
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : null} disabled={step === 0} className="btn" style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--line)',
            color: step === 0 ? 'var(--text-faint)' : 'var(--text)',
            opacity: step === 0 ? 0.4 : 1,
          }}>
            <I name="chevron-right" size={16} style={{ transform: 'rotate(180deg)' }}/>
          </button>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {step + 1} / {STEPS.length}
          </span>
          {!isLast && canAdvance() && (
            <button onClick={() => onDone(null)} className="btn" style={{
              padding: '6px 10px', borderRadius: 8,
              background: 'transparent', color: 'var(--text-faint)',
              fontSize: 11, fontWeight: 600,
            }}>SALTAR</button>
          )}
          {(isLast || !canAdvance()) && <span style={{ width: 50 }}/>}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '32px 24px 24px',
        position: 'relative',
      }}>
        <div key={step} style={{ animation: 'screenIn 240ms cubic-bezier(.2,.9,.3,1)' }}>
          <div className="label" style={{ color: 'var(--orange-bright)', marginBottom: 10 }}>
            PASO {step + 1} DE {STEPS.length}
          </div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 34, lineHeight: 1, color: 'var(--text)' }}>{cur.title}</h1>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.45 }}>{cur.sub}</div>

          <div style={{ marginTop: 28 }}>
            {cur.id === 'city' && (
              <CityStep
                city={city} setCity={setCity}
                results={cityResults} searching={searching}
                onPick={pickCity} picked={cityCoords}
              />
            )}
            {cur.id === 'activity' && (
              <GridChoice options={ACTIVITIES} value={activity} onChange={setActivity} icon/>
            )}
            {cur.id === 'level' && (
              <ListChoice options={LEVELS_EXP} value={level} onChange={setLevel}/>
            )}
            {cur.id === 'goal' && (
              <GridChoice options={GOALS} value={goal} onChange={setGoal} icon cols={2}/>
            )}
            {cur.id === 'weekly' && (
              <WeeklyKmStep value={weeklyKm} setValue={setWeeklyKm}/>
            )}
            {cur.id === 'time' && (
              <ListChoice options={TIMES} value={preferredTime} onChange={setPreferredTime} icon/>
            )}
            {cur.id === 'community' && (
              <CommunityStep
                joinCommunity={joinCommunity} setJoinCommunity={setJoinCommunity}
                notifications={notifications} setNotifications={setNotifications}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '12px 24px 28px', position: 'relative' }}>
        <button onClick={next} disabled={!canAdvance() && !isLast} className="btn btn-primary" style={{
          width: '100%',
          opacity: canAdvance() || isLast ? 1 : 0.4,
        }}>
          {isLast ? (
            <>
              <I name="bolt" size={16} color="#0A0507"/>
              ¡Listo, vamos!
            </>
          ) : (
            <>
              Continuar
              <I name="chevron-right" size={14} color="#0A0507"/>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function CityStep({ city, setCity, results, searching, onPick, picked }) {
  const I = window.Icon;
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface)', border: `1px solid ${picked ? 'rgba(198,255,61,0.4)' : 'var(--line)'}`,
        borderRadius: 14, padding: '0 14px', height: 54,
      }}>
        <I name={picked ? 'location' : 'search'} size={16} color={picked ? 'var(--green-bright)' : 'var(--text-faint)'}/>
        <input
          autoFocus
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ciudad, barrio o pueblo"
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--text)', fontFamily: 'var(--body)', fontSize: 15, fontWeight: 600,
          }}
        />
        {searching && (
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--text-faint)', borderTopColor: 'var(--orange-bright)', animation: 'ringRotate 700ms linear infinite' }}/>
        )}
      </div>

      {results.length > 0 && !picked && (
        <div style={{ marginTop: 10, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {results.map((r, i) => (
            <button key={i} onClick={() => onPick(r)} style={{
              width: '100%', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', border: 0, background: 'transparent',
              color: 'var(--text)', cursor: 'pointer',
              borderBottom: i < results.length - 1 ? '1px solid var(--line)' : 0,
            }}>
              <I name="location" size={14} color="var(--orange-bright)"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.full}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {picked && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--green-soft)', borderRadius: 12, border: '1px solid rgba(198,255,61,0.3)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--green-bright)', fontWeight: 600 }}>
          <I name="bolt" size={12} color="var(--green-bright)"/>
          Ubicación detectada. Te conectaremos con la comunidad local.
        </div>
      )}
    </div>
  );
}

function GridChoice({ options, value, onChange, icon, cols = 2 }) {
  const I = window.Icon;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} className="btn" style={{
            flexDirection: 'column', gap: 10,
            padding: '20px 12px', borderRadius: 16,
            background: active ? `${o.color || '#FF4D1A'}15` : 'var(--surface)',
            border: `1px solid ${active ? (o.color || '#FF4D1A') + '88' : 'var(--line)'}`,
            color: active ? (o.color || 'var(--orange-bright)') : 'var(--text)',
            minHeight: 110,
          }}>
            {icon && <I name={o.icon} size={32}/>}
            <div style={{ fontSize: 14, fontWeight: 700 }}>{o.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function ListChoice({ options, value, onChange, icon }) {
  const I = window.Icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(o => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)} className="btn" style={{
            justifyContent: 'flex-start',
            padding: '14px 16px', borderRadius: 14,
            background: active ? (o.color || '#FF4D1A') + '15' : 'var(--surface)',
            border: `1px solid ${active ? (o.color || '#FF4D1A') + '66' : 'var(--line)'}`,
            color: 'var(--text)', gap: 14,
            textAlign: 'left',
          }}>
            {icon && (
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: active ? (o.color || '#FF4D1A') + '22' : 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active ? (o.color || 'var(--orange-bright)') : 'var(--text-dim)',
                flexShrink: 0,
              }}>
                <I name={o.icon} size={20}/>
              </div>
            )}
            {!icon && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${active ? (o.color || 'var(--orange-bright)') : 'var(--line-strong)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: o.color || 'var(--orange-bright)' }}/>}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: active ? (o.color || 'var(--orange-bright)') : 'var(--text)' }}>{o.label}</div>
              {o.sub && <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontWeight: 500 }}>{o.sub}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WeeklyKmStep({ value, setValue }) {
  const ranges = [
    { range: [0, 14], label: 'Tranquilo', color: '#9AA0AB' },
    { range: [15, 39], label: 'Constante', color: '#C6FF3D' },
    { range: [40, 79], label: 'Ambicioso', color: '#FFB31A' },
    { range: [80, 200], label: 'Bestia', color: '#FF4D1A' },
  ];
  const current = ranges.find(r => value >= r.range[0] && value <= r.range[1]) || ranges[0];
  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="metric" style={{ fontSize: 96, color: current.color, lineHeight: 1 }}>{value}</div>
        <div className="mono" style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 4 }}>km / semana</div>
        <div style={{ marginTop: 18, display: 'inline-block', padding: '6px 14px', borderRadius: 99, background: `${current.color}1F`, border: `1px solid ${current.color}55`, color: current.color, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {current.label}
        </div>
      </div>
      <input type="range" min="0" max="100" step="5" value={value}
        onChange={e => setValue(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: current.color, height: 24, marginTop: 10 }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100+</span>
      </div>
    </div>
  );
}

function CommunityStep({ joinCommunity, setJoinCommunity, notifications, setNotifications }) {
  const I = window.Icon;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <ToggleRow
        icon="community" iconColor="#C6FF3D"
        title="Unirme a la comunidad local"
        sub="Ranking semanal, kudos y feed de tu zona"
        value={joinCommunity} onChange={setJoinCommunity}
      />
      <ToggleRow
        icon="bolt" iconColor="#FF6E3D"
        title="Notificaciones inteligentes"
        sub="Rutas sugeridas, retos diarios y avisos de clima"
        value={notifications} onChange={setNotifications}
      />
      <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,77,26,0.06)', border: '1px solid rgba(255,77,26,0.18)', borderRadius: 14, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--orange-bright)' }}>Privacidad:</strong> tus rutas son privadas por defecto. Decides qué compartir en cada actividad.
      </div>
    </div>
  );
}

function ToggleRow({ icon, iconColor, title, sub, value, onChange }) {
  const I = window.Icon;
  return (
    <button onClick={() => onChange(!value)} className="btn" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
      color: 'var(--text)', textAlign: 'left',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${iconColor}1F`, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <I name={icon} size={20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{
        width: 44, height: 26, borderRadius: 999,
        background: value ? 'var(--orange)' : 'var(--surface-3)',
        position: 'relative',
        transition: 'background 200ms',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 21 : 3,
          width: 20, height: 20, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          transition: 'left 220ms cubic-bezier(.34,1.56,.64,1)',
        }}/>
      </div>
    </button>
  );
}

window.OnboardingScreen = OnboardingScreen;
