// routes.jsx — Akktivate Route Generator
const { useState: useRStateRT, useEffect: useREffectRT, useMemo: useRMemoRT } = React;

// ── SVG route map — generates a route based on params ──────────
function RouteMap({ activity, distance, difficulty, animated = true, dark = true, location = 'Madrid' }) {
  // Seeded path generation
  const seed = `${activity}-${distance}-${difficulty}-${location}`;
  const points = useRMemoRT(() => {
    // pseudo random from seed
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
    const segCount = 12 + Math.floor(distance / 4);
    const pts = [];
    let x = 40, y = 240;
    pts.push([x, y]);
    for (let i = 0; i < segCount; i++) {
      const angle = rand() * Math.PI * 2;
      const step = 28 + rand() * 32;
      x = Math.max(40, Math.min(320, x + Math.cos(angle) * step));
      y = Math.max(40, Math.min(280, y + Math.sin(angle) * step));
      pts.push([x, y]);
    }
    return pts;
  }, [seed]);

  const pathD = useRMemoRT(() => {
    // smooth path using quadratic curves
    if (!points.length) return "";
    let d = `M${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      d += ` Q${x1},${y1} ${cx},${cy}`;
    }
    const last = points[points.length - 1];
    d += ` T${last[0]},${last[1]}`;
    return d;
  }, [points]);

  const start = points[0];
  const end = points[points.length - 1];
  const midPOIs = useRMemoRT(() => {
    if (points.length < 6) return [];
    const idxs = [Math.floor(points.length * 0.3), Math.floor(points.length * 0.62)];
    return idxs.map((i, k) => ({ pt: points[i], label: k === 0 ? "Mirador" : "Fuente", icon: k === 0 ? "mountain" : "weather" }));
  }, [points]);

  const I = window.Icon;
  const totalLen = 4200;

  return (
    <div className="map-bg" style={{ height: 280, position: 'relative' }}>
      {/* grid */}
      <svg viewBox="0 0 360 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF4D1A"/>
            <stop offset="100%" stopColor="#FFB31A"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="360" height="320" fill="url(#grid)"/>

        {/* contour lines (terrain) */}
        <g opacity="0.18" fill="none" stroke="#C6FF3D" strokeWidth="0.6">
          <ellipse cx="240" cy="120" rx="80" ry="50"/>
          <ellipse cx="240" cy="120" rx="55" ry="34"/>
          <ellipse cx="240" cy="120" rx="32" ry="20"/>
          <ellipse cx="80" cy="220" rx="60" ry="40"/>
          <ellipse cx="80" cy="220" rx="38" ry="24"/>
        </g>

        {/* shadow path */}
        <path d={pathD} fill="none" stroke="rgba(255,77,26,0.25)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        {/* main path */}
        <path d={pathD} fill="none" stroke="url(#routeGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
          filter="url(#glow)"
          strokeDasharray={animated ? totalLen : undefined}
          strokeDashoffset={animated ? totalLen : 0}
          style={animated ? { animation: 'drawLine 2.2s cubic-bezier(.4,0,.2,1) forwards' } : undefined}/>

        {/* dashed direction indicator */}
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.5"/>

        {/* Start point */}
        <g transform={`translate(${start[0]},${start[1]})`}>
          <circle r="10" fill="rgba(198,255,61,0.2)"/>
          <circle r="6" fill="#C6FF3D"/>
          <circle r="3" fill="#0A0507"/>
        </g>
        {/* End point — pulsing */}
        <g transform={`translate(${end[0]},${end[1]})`}>
          <circle r="14" fill="rgba(255,77,26,0.25)">
            <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle r="7" fill="#FF4D1A"/>
          <path d="M-2,-3 L3,0 L-2,3 Z" fill="#0A0507"/>
        </g>

        {/* POIs */}
        {midPOIs.map((p, i) => (
          <g key={i} transform={`translate(${p.pt[0]},${p.pt[1]})`}>
            <circle r="9" fill="#14171C" stroke="#FFB31A" strokeWidth="1.5"/>
            <circle r="2.5" fill="#FFB31A"/>
          </g>
        ))}
      </svg>

      {/* labels overlay */}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, maxWidth: 'calc(100% - 90px)' }}>
        <span className="kbd" style={{ background: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          <I name="location" size={10}/> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</span>
        </span>
      </div>
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
        <button style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(0,0,0,0.5)', border: '1px solid var(--line)',
          color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><I name="plus" size={14}/></button>
        <button style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(0,0,0,0.5)', border: '1px solid var(--line)',
          color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}><I name="minus" size={14}/></button>
      </div>

      {/* legend pill */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6 }}>
        <span className="kbd" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#C6FF3D' }}/>Inicio
        </span>
        <span className="kbd" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: '#FF4D1A' }}/>Meta
        </span>
      </div>
    </div>
  );
}

function RoutesScreen({ onAskAI, profile }) {
  const I = window.Icon;
  const { SectionHead, ProgressBar } = window;

  const [activity, setActivity] = useRStateRT(profile?.activity || 'run');
  const [distance, setDistance] = useRStateRT(10);
  const [difficulty, setDifficulty] = useRStateRT(profile?.level === 'rookie' ? 'facil' : profile?.level === 'pro' ? 'duro' : 'medio');
  const [location, setLocation] = useRStateRT(profile?.city || 'Madrid · Retiro');
  const [generating, setGenerating] = useRStateRT(false);
  const [generated, setGenerated] = useRStateRT(true);
  const [routeKey, setRouteKey] = useRStateRT(0);
  const [gpsState, setGpsState] = useRStateRT('idle'); // idle | locating | ok | error
  const [weather, setWeather] = useRStateRT(null);
  const [coords, setCoords] = useRStateRT(null); // {lat,lng}
  const [manualOpen, setManualOpen] = useRStateRT(false);
  const [manualQuery, setManualQuery] = useRStateRT('');
  const [results, setResults] = useRStateRT([]);
  const [searching, setSearching] = useRStateRT(false);
  const [mapOpen, setMapOpen] = useRStateRT(false);

  // Preload cached location/weather
  React.useEffect(() => {
    if (!window.AKK_TOOLS) return;
    if (profile?.cityCoords) {
      // Use onboarding-provided coords
      (async () => {
        try {
          const w = await window.AKK_TOOLS.getWeather(profile.cityCoords.lat, profile.cityCoords.lng);
          setWeather(w);
          setCoords(profile.cityCoords);
          if (profile.city) setLocation(profile.city);
        } catch (e) {}
      })();
    } else {
      window.AKK_TOOLS.getLocationAndWeather().then(ctx => {
        if (ctx?.geo?.label) setLocation(ctx.geo.label);
        if (ctx?.weather) setWeather(ctx.weather);
        if (ctx?.pos) setCoords(ctx.pos);
        if (ctx?.real) setGpsState('ok');
      }).catch(() => {});
    }
  }, [profile?.cityCoords?.lat]);

  // Debounced address search
  React.useEffect(() => {
    if (!manualQuery.trim() || manualQuery.trim().length < 3) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await window.AKK_TOOLS.forwardGeocode(manualQuery);
        setResults(res);
      } catch (e) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 380);
    return () => clearTimeout(t);
  }, [manualQuery]);

  async function pickResult(r) {
    setLocation(r.label);
    setCoords({ lat: r.lat, lng: r.lng });
    setManualOpen(false);
    setManualQuery('');
    setResults([]);
    setGpsState('manual');
    // Fetch weather for picked location
    try {
      const w = await window.AKK_TOOLS.getWeather(r.lat, r.lng);
      setWeather(w);
    } catch (e) {}
    // Regenerate route around this location
    setRouteKey(k => k + 1);
  }

  async function requestGPS() {
    setGpsState('locating');
    try {
      window.AKK_TOOLS.clearCache();
      const ctx = await window.AKK_TOOLS.getLocationAndWeather();
      if (ctx?.geo?.label) setLocation(ctx.geo.label);
      if (ctx?.weather) setWeather(ctx.weather);
      if (ctx?.pos) setCoords(ctx.pos);
      setGpsState(ctx.real ? 'ok' : 'error');
    } catch (e) {
      setGpsState('error');
    }
  }

  const activities = [
    { id: 'run', label: 'Running', icon: 'run' },
    { id: 'bike', label: 'Ciclismo', icon: 'bike' },
    { id: 'trail', label: 'Trail', icon: 'trail' },
    { id: 'mtb', label: 'MTB', icon: 'mtb' },
  ];

  const difficulties = [
    { id: 'facil', label: 'Fácil', color: '#C6FF3D' },
    { id: 'medio', label: 'Medio', color: '#FFB31A' },
    { id: 'duro', label: 'Duro', color: '#FF4D1A' },
    { id: 'pro', label: 'Pro', color: '#E66BFF' },
  ];

  // Generated metrics
  const speedMap = { run: 11, bike: 22, trail: 9, mtb: 14 }; // km/h
  const diffMult = { facil: 0.85, medio: 1, duro: 1.18, pro: 1.4 };
  const elevPerKm = { facil: 8, medio: 18, duro: 32, pro: 55 };

  const time = Math.round((distance / speedMap[activity]) * diffMult[difficulty] * 60); // mins
  const elevation = Math.round(distance * elevPerKm[difficulty] * (activity === 'trail' || activity === 'mtb' ? 1.35 : 1));
  const xpReward = Math.round(distance * 30 * diffMult[difficulty]);
  const kcal = Math.round(distance * 70 * (activity === 'run' ? 1.1 : activity === 'trail' ? 1.2 : 0.65));

  function fmtTime(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    return h ? `${h}h ${mm}m` : `${mm}m`;
  }

  function generate() {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setRouteKey(k => k + 1);
    }, 900);
  }

  return (
    <div className="screen screen-in">
      <ScreenHeaderInline title="Rutas" sub="GENERADOR" />

      <div style={{ padding: '0 20px' }}>
        {/* Location */}
        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,77,26,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--orange-bright)'
          }}>
            <I name="location" size={18}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="label" style={{ fontSize: 10 }}>Punto de salida</div>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</div>
          </div>
          <button onClick={requestGPS} className={`btn-chip ${gpsState === 'ok' ? 'is-active-green' : 'is-active'}`} style={{ height: 32 }}>
            {gpsState === 'locating' ? (
              <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'ringRotate 700ms linear infinite' }}/>
            ) : (
              <I name="target" size={12}/>
            )}
            {gpsState === 'ok' ? 'GPS · ON' : gpsState === 'manual' ? 'MANUAL' : gpsState === 'locating' ? 'Buscando…' : 'GPS'}
          </button>
        </div>

        {/* Manual address toggle + search */}
        <div style={{ marginTop: 8 }}>
          {!manualOpen ? (
            <button onClick={() => setManualOpen(true)} className="btn" style={{
              width: '100%', padding: '10px 14px',
              background: 'transparent', border: '1px dashed var(--line-strong)',
              borderRadius: 12, color: 'var(--text-dim)',
              fontSize: 13, fontWeight: 600, gap: 8,
            }}>
              <I name="search" size={14} color="var(--text-dim)"/>
              Introducir dirección manualmente
            </button>
          ) : (
            <div className="card" style={{ padding: 12, animation: 'screenIn 220ms cubic-bezier(.2,.9,.3,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px' }}>
                <I name="search" size={16} color="var(--text-dim)"/>
                <input
                  autoFocus
                  value={manualQuery}
                  onChange={e => setManualQuery(e.target.value)}
                  placeholder="Ej. Parque del Retiro, Madrid"
                  style={{
                    flex: 1, background: 'transparent', border: 0, outline: 'none',
                    color: 'var(--text)', fontFamily: 'var(--body)', fontSize: 14, fontWeight: 600,
                    minWidth: 0, padding: '10px 0',
                  }}
                />
                {searching && (
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--text-faint)', borderTopColor: 'var(--orange-bright)', animation: 'ringRotate 700ms linear infinite' }}/>
                )}
                <button onClick={() => { setManualOpen(false); setManualQuery(''); setResults([]); }} style={{
                  width: 28, height: 28, borderRadius: 8, border: 0,
                  background: 'var(--surface-2)', color: 'var(--text-dim)',
                  cursor: 'pointer', fontSize: 14, lineHeight: 1,
                }}>×</button>
              </div>

              {/* Results dropdown */}
              {results.length > 0 && (
                <div style={{ marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => pickResult(r)} style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 6px', border: 0, background: 'transparent',
                      color: 'var(--text)', cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'background 120ms',
                    }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-2)'}
                       onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <I name="location" size={14} color="var(--orange-bright)"/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.full}</div>
                      </div>
                      <I name="chevron-right" size={14} color="var(--text-faint)"/>
                    </button>
                  ))}
                </div>
              )}
              {!searching && manualQuery.trim().length >= 3 && results.length === 0 && (
                <div style={{ marginTop: 8, padding: '8px 6px', fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
                  Sin resultados. Prueba con otra dirección.
                </div>
              )}
              <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-faint)', padding: '0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-bright)' }} className="pulse-dot"/>
                Geocoding por OpenStreetMap Nominatim
              </div>
            </div>
          )}
        </div>

        {/* Real weather chip */}
        {weather?.current && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12 }}>
            <span style={{ fontSize: 22 }}>{window.AKK_TOOLS.weatherIcon(weather.current.weather_code, weather.current.is_day)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {Math.round(weather.current.temperature_2m)}°C · {window.AKK_TOOLS.describeWMO(weather.current.weather_code)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1 }}>
                Viento {Math.round(weather.current.wind_speed_10m)} km/h · Hum {Math.round(weather.current.relative_humidity_2m)}%
              </div>
            </div>
            {(() => {
              const cond = window.AKK_TOOLS.runningCondition(weather);
              return (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="label" style={{ fontSize: 9 }}>PARA CORRER</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: cond.color }}>{cond.label}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Activity type */}
        <div style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Tipo de actividad</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {activities.map(a => {
              const isActive = activity === a.id;
              return (
                <button key={a.id} onClick={() => setActivity(a.id)}
                  className="btn"
                  style={{
                    flexDirection: 'column', gap: 6, padding: '14px 6px',
                    background: isActive ? 'rgba(255,77,26,0.12)' : 'var(--surface)',
                    border: `1px solid ${isActive ? 'rgba(255,77,26,0.5)' : 'var(--line)'}`,
                    borderRadius: 14,
                    color: isActive ? 'var(--orange-bright)' : 'var(--text-dim)',
                  }}>
                  <I name={a.icon} size={22}/>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance slider */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="label">Distancia objetivo</div>
            <div>
              <span className="metric" style={{ fontSize: 24, color: 'var(--orange-bright)' }}>{distance}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>km</span>
            </div>
          </div>
          <input type="range" min="2" max="50" value={distance} step="1"
            onChange={e => setDistance(parseInt(e.target.value))}
            style={{
              width: '100%', accentColor: 'var(--orange)',
              height: 24,
            }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>
            <span>2 km</span><span>10</span><span>25</span><span>50 km</span>
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ marginTop: 18 }}>
          <div className="label" style={{ marginBottom: 10 }}>Dificultad</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {difficulties.map(d => {
              const isActive = difficulty === d.id;
              return (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className="btn"
                  style={{
                    flex: 1, height: 44, borderRadius: 12,
                    background: isActive ? `${d.color}1F` : 'var(--surface)',
                    border: `1px solid ${isActive ? d.color + '88' : 'var(--line)'}`,
                    color: isActive ? d.color : 'var(--text-dim)',
                    fontWeight: 700, fontSize: 13,
                  }}>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <button onClick={generate} className="btn btn-primary" style={{ width: '100%', marginTop: 20 }}>
          <I name="bolt" size={16} color="#0A0507"/>
          {generating ? 'Calculando ruta…' : 'Regenerar ruta'}
        </button>
      </div>

      {/* Generated route */}
      {(generating || generated) && (
        <div style={{ padding: '20px 20px 0' }}>
          <SectionHead title="Tu ruta" right={
            <span className="kbd"><I name="bolt" size={10} color="var(--green-bright)"/> AI</span>
          }/>
          <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: generating ? 0.5 : 1, transition: 'opacity 200ms' }}>
            <div style={{ position: 'relative' }}>
              <RouteMap key={routeKey} activity={activity} distance={distance} difficulty={difficulty} animated={true} location={location}/>
              {generating && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(8,9,11,0.6)', backdropFilter: 'blur(2px)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      border: '3px solid rgba(255,77,26,0.2)', borderTopColor: 'var(--orange)',
                      animation: 'ringRotate 800ms linear infinite',
                      margin: '0 auto 12px',
                    }}/>
                    <div className="label" style={{ color: 'var(--orange-bright)' }}>Generando…</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="label" style={{ marginBottom: 4 }}>RUTA GENERADA</div>
                  <div className="h-display" style={{ fontSize: 22, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location} Loop</div>
                </div>
                <div className="kbd" style={{ color: 'var(--green-bright)', background: 'var(--green-soft)', borderColor: 'rgba(198,255,61,0.3)', flexShrink: 0 }}>
                  +{xpReward} XP
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <RouteMetric icon="route" label="Distancia" value={distance} unit="km"/>
                <RouteMetric icon="clock" label="Tiempo" value={fmtTime(time)} unit=""/>
                <RouteMetric icon="elev" label="Desnivel" value={`+${elevation}`} unit="m"/>
                <RouteMetric icon="kcal" label="Kcal" value={kcal} unit=""/>
              </div>

              {/* Elevation profile */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="label" style={{ fontSize: 10 }}>Perfil de elevación</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>máx {Math.round(elevation * 1.5)}m</div>
                </div>
                <ElevationProfile key={routeKey} difficulty={difficulty}/>
              </div>

              {/* POIs */}
              <div style={{ marginTop: 16 }}>
                <div className="label" style={{ fontSize: 10, marginBottom: 8 }}>Puntos de interés</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <POIChip icon="mountain" label="Mirador" color="#FFB31A"/>
                  <POIChip icon="weather" label="Fuente" color="#5DC9F2"/>
                  <POIChip icon="trophy" label="Segmento PR" color="#C6FF3D"/>
                </div>
              </div>

              <button onClick={() => setMapOpen(true)} className="btn btn-primary" style={{ width: '100%', marginTop: 18, background: 'var(--green)', boxShadow: 'var(--shadow-glow-green)' }}>
                <I name="play" size={16} color="#0A0507"/>
                Empezar ahora
              </button>

              {onAskAI && (
                <div style={{ marginTop: 12 }}>
                  <window.AIInlineLauncher
                    onClick={() => onAskAI([
                      { role: 'assistant', content: `Estás generando una ruta de ${distance} km · ${activity} · dificultad ${difficulty} desde ${location}. ¿Quieres consejos sobre ritmo, hidratación o si las condiciones son buenas?` },
                    ])}
                    label="¿Es buen día para esta ruta?"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <LiveMapView open={mapOpen} onClose={() => setMapOpen(false)}
        coords={coords} location={location} distance={distance} activity={activity}
        time={time} elevation={elevation} xp={xpReward} kcal={kcal}/>
    </div>
  );
}

function LiveMapView({ open, onClose, coords, location, distance, activity, time, elevation, xp, kcal }) {
  const I = window.Icon;
  const [tracking, setTracking] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (!tracking) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [tracking]);

  function fmt(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h ? `${String(h).padStart(2,'0')}:` : '') + `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  if (!open) return null;

  const lat = coords?.lat || 40.4153;
  const lng = coords?.lng || -3.6843;
  const delta = 0.012;
  // OpenStreetMap embed — free, no key, no watermark, real streets+names
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-delta}%2C${lat-delta}%2C${lng+delta}%2C${lat+delta}&layer=mapnik&marker=${lat}%2C${lng}`;
  // External Google Maps — directions from current location to the route point, walking/biking
  const travelMode = (activity === 'bike' || activity === 'mtb') ? 'bicycling' : 'walking';
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}&travelmode=${travelMode}`;
  const gmapsViewUrl = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
  const osmFullUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  function openExternal(url) {
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback if popup blocked: open via temporary <a> click (uses top-level browsing context)
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        document.body.appendChild(a); a.click(); a.remove();
      }
    } catch (e) {
      window.location.href = url;
    }
  }

  const labelMap = { run: 'Running', bike: 'Ciclismo', trail: 'Trail', mtb: 'MTB' };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: '#000',
      animation: 'sheetUp 280ms cubic-bezier(.2,.9,.3,1)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Map iframe */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <iframe
          src={osmUrl}
          style={{ width: '100%', height: '100%', border: 0, filter: 'invert(0.92) hue-rotate(180deg) saturate(0.7)' }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Top header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
        padding: '50px 16px 18px',
        background: 'linear-gradient(180deg, rgba(8,9,11,0.95), rgba(8,9,11,0.7) 60%, transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(20,23,28,0.9)', border: '1px solid var(--line)',
            color: 'var(--text)', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, lineHeight: 1, paddingBottom: 2,
          }}>×</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="label" style={{ color: tracking ? 'var(--green-bright)' : 'var(--orange-bright)', marginBottom: 2 }}>
              {tracking ? '● EN RUTA' : 'RUTA LISTA'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{location}</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 10px', borderRadius: 999,
            background: 'rgba(20,23,28,0.9)', border: '1px solid var(--line)',
            color: 'var(--text-dim)', fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ color: 'var(--orange-bright)' }}>{labelMap[activity]}</span>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
        padding: '20px 16px 26px',
        background: 'linear-gradient(0deg, rgba(8,9,11,0.98), rgba(8,9,11,0.85) 80%, transparent)',
      }}>
        {/* Live stats while tracking */}
        {tracking && (
          <div style={{
            background: 'rgba(20,23,28,0.95)', border: '1px solid var(--line-strong)',
            borderRadius: 16, padding: 16, marginBottom: 12,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          }}>
            <LiveStat label="Tiempo" value={fmt(seconds)} accent="var(--green-bright)"/>
            <LiveStat label="Distancia" value="0.0" unit="km"/>
            <LiveStat label="Ritmo" value="--:--" unit="/km"/>
          </div>
        )}

        {/* Pre-route metrics */}
        {!tracking && (
          <div style={{
            background: 'rgba(20,23,28,0.95)', border: '1px solid var(--line-strong)',
            borderRadius: 16, padding: 14, marginBottom: 12,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              <LiveStat label="Distancia" value={distance} unit="km"/>
              <LiveStat label="Tiempo" value={`${time}m`}/>
              <LiveStat label="Desnivel" value={`+${elevation}`} unit="m"/>
              <LiveStat label="Kcal" value={kcal}/>
            </div>
          </div>
        )}

        {/* Actions */}
        {!tracking ? (
          <button onClick={() => setTracking(true)} className="btn btn-primary" style={{
            width: '100%', background: 'var(--green)', boxShadow: 'var(--shadow-glow-green)',
          }}>
            <I name="play" size={16} color="#0A0507"/>
            Empezar tracking
          </button>
        ) : (
          <button onClick={() => { setTracking(false); setSeconds(0); }} className="btn btn-primary" style={{
            width: '100%', background: '#FF4D1A',
          }}>
            <span style={{ width: 12, height: 12, background: '#0A0507', borderRadius: 2 }}/>
            Finalizar
          </button>
        )}

        {/* External links */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); openExternal(gmapsUrl); }} className="btn" style={{
            flex: 1, height: 44, borderRadius: 12,
            background: 'rgba(20,23,28,0.9)', border: '1px solid var(--line)',
            color: 'var(--text)', textDecoration: 'none', fontSize: 12, fontWeight: 700, gap: 6,
          }}>
            <GoogleMapsG/>
            Cómo llegar
          </a>
          <a href={gmapsViewUrl} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); openExternal(gmapsViewUrl); }} className="btn" style={{
            flex: 1, height: 44, borderRadius: 12,
            background: 'rgba(20,23,28,0.9)', border: '1px solid var(--line)',
            color: 'var(--text)', textDecoration: 'none', fontSize: 12, fontWeight: 700, gap: 6,
          }}>
            <I name="location" size={14} color="#EA4335"/>
            Ver zona
          </a>
          <a href={osmFullUrl} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); openExternal(osmFullUrl); }} className="btn" style={{
            flex: 1, height: 44, borderRadius: 12,
            background: 'rgba(20,23,28,0.9)', border: '1px solid var(--line)',
            color: 'var(--text)', textDecoration: 'none', fontSize: 12, fontWeight: 700, gap: 6,
          }}>
            <I name="compass" size={14} color="var(--green-bright)"/>
            OSM
          </a>
        </div>
        <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-faint)', textAlign: 'center' }}>
          Mapa real vía OpenStreetMap · sin API key
        </div>
      </div>
    </div>
  );
}

function LiveStat({ label, value, unit, accent }) {
  return (
    <div>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 4 }}>
        <span className="metric" style={{ fontSize: 18, color: accent || 'var(--text)' }}>{value}</span>
        {unit && <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function GoogleMapsG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" fill="#EA4335"/>
    </svg>
  );
}

function ScreenHeaderInline({ title, sub }) {
  return (
    <div style={{ padding: '8px 20px 16px' }}>
      <div className="label" style={{ marginBottom: 4, color: 'var(--orange-bright)' }}>{sub}</div>
      <h1 className="h-display" style={{ margin: 0, fontSize: 42 }}>{title}</h1>
    </div>
  );
}

function RouteMetric({ icon, label, value, unit }) {
  const I = window.Icon;
  return (
    <div style={{
      background: 'var(--surface-2)', border: '1px solid var(--line)',
      borderRadius: 12, padding: 10,
    }}>
      <I name={icon} size={14} color="var(--text-faint)"/>
      <div className="metric" style={{ fontSize: 18, marginTop: 6 }}>
        {value}{unit && <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 2 }}>{unit}</span>}
      </div>
      <div className="label" style={{ fontSize: 9, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function POIChip({ icon, label, color }) {
  const I = window.Icon;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: `${color}14`, border: `1px solid ${color}44`,
      color, fontSize: 12, fontWeight: 600,
    }}>
      <I name={icon} size={12}/>
      {label}
    </div>
  );
}

function ElevationProfile({ difficulty }) {
  const profile = useRMemoRT(() => {
    let h = 0;
    for (let i = 0; i < difficulty.length; i++) h = (h * 31 + difficulty.charCodeAt(i)) >>> 0;
    const rand = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
    const peaks = { facil: 0.3, medio: 0.55, duro: 0.85, pro: 1 };
    const peak = peaks[difficulty];
    const pts = [];
    let y = 0.2;
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const curve = Math.sin(t * Math.PI) * peak;
      y = curve * 0.8 + (rand() - 0.5) * 0.2;
      pts.push([t * 320, 60 - Math.max(0, y) * 50]);
    }
    return pts;
  }, [difficulty]);

  const pathD = `M0,60 ${profile.map(p => `L${p[0]},${p[1]}`).join(' ')} L320,60 Z`;
  const lineD = `M${profile.map(p => `${p[0]},${p[1]}`).join(' L')}`;

  return (
    <svg viewBox="0 0 320 64" style={{ width: '100%', height: 56 }}>
      <defs>
        <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4D1A" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#FF4D1A" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={pathD} fill="url(#elevGrad)"/>
      <path d={lineD} fill="none" stroke="#FF6E3D" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

window.RoutesScreen = RoutesScreen;
