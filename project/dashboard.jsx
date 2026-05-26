// dashboard.jsx — Akktivate Dashboard / Inicio
const { useState: useStateDB, useEffect: useEffectDB } = React;

// ── Example community routes (with placeholder photos) ────────
const EXAMPLE_ROUTES = [
  {
    id: 'er1', title: 'Bosque al amanecer', author: 'Lucía V.', initials: 'LV', authorColor: '#C6FF3D',
    type: 'run', km: 8.2, time: '42:18', elev: 86, kudos: 124, when: 'Hace 2 h',
    img: 'https://picsum.photos/seed/akk-forest-run/600/400',
  },
  {
    id: 'er2', title: 'Sierra Norte Climb', author: 'David R.', initials: 'DR', authorColor: '#5DC9F2',
    type: 'bike', km: 32.1, time: '1:24:50', elev: 720, kudos: 89, when: 'Ayer',
    img: 'https://picsum.photos/seed/akk-mountain-bike/600/400',
  },
  {
    id: 'er3', title: 'Trail bajo la lluvia', author: 'Ane P.', initials: 'AP', authorColor: '#FFB31A',
    type: 'trail', km: 14.6, time: '1:38:42', elev: 380, kudos: 212, when: 'Hace 5 h',
    img: 'https://picsum.photos/seed/akk-trail-rain/600/400',
  },
  {
    id: 'er4', title: 'Río al atardecer', author: 'Iván S.', initials: 'IS', authorColor: '#FF6E3D',
    type: 'run', km: 10.0, time: '47:12', elev: 32, kudos: 76, when: 'Hace 1 d',
    img: 'https://picsum.photos/seed/akk-sunset-river/600/400',
  },
  {
    id: 'er5', title: 'MTB Casa de Campo', author: 'Núria C.', initials: 'NC', authorColor: '#E6E6FF',
    type: 'mtb', km: 18.3, time: '1:14:09', elev: 240, kudos: 54, when: 'Hace 2 d',
    img: 'https://picsum.photos/seed/akk-mtb-singletrack/600/400',
  },
  {
    id: 'er6', title: 'Cumbre Pedriza', author: 'Marc G.', initials: 'MG', authorColor: '#FF4D1A',
    type: 'trail', km: 22.4, time: '2:48:00', elev: 1240, kudos: 318, when: 'Hace 3 d',
    img: 'https://picsum.photos/seed/akk-summit-pedriza/800/600',
  },
  {
    id: 'er7', title: 'Costa norte 50K', author: 'Elena R.', initials: 'ER', authorColor: '#5DC9F2',
    type: 'bike', km: 52.7, time: '2:14:30', elev: 420, kudos: 196, when: 'Hace 4 d',
    img: 'https://picsum.photos/seed/akk-coast-bike/800/600',
  },
  {
    id: 'er8', title: 'Volcán Teide', author: 'Pablo M.', initials: 'PM', authorColor: '#FFB31A',
    type: 'trail', km: 28.0, time: '4:10:00', elev: 1860, kudos: 502, when: 'Hace 1 sem',
    img: 'https://picsum.photos/seed/akk-teide-trail/800/600',
  },
  {
    id: 'er9', title: 'Centro histórico', author: 'Sara F.', initials: 'SF', authorColor: '#C6FF3D',
    type: 'run', km: 5.4, time: '27:18', elev: 28, kudos: 42, when: 'Hace 1 sem',
    img: 'https://picsum.photos/seed/akk-city-run/800/600',
  },
  {
    id: 'er10', title: 'Picos de Europa', author: 'Hugo T.', initials: 'HT', authorColor: '#9AA0FF',
    type: 'mtb', km: 38.2, time: '3:24:50', elev: 1450, kudos: 412, when: 'Hace 2 sem',
    img: 'https://picsum.photos/seed/akk-picos-mtb/800/600',
  },
  {
    id: 'er11', title: 'Desierto Bardenas', author: 'Clara V.', initials: 'CV', authorColor: '#FF6E3D',
    type: 'bike', km: 64.5, time: '3:02:00', elev: 380, kudos: 268, when: 'Hace 2 sem',
    img: 'https://picsum.photos/seed/akk-desert-bardenas/800/600',
  },
  {
    id: 'er12', title: 'Camino del faro', author: 'Diego A.', initials: 'DA', authorColor: '#E6E6FF',
    type: 'trail', km: 16.8, time: '1:52:00', elev: 290, kudos: 154, when: 'Hace 3 sem',
    img: 'https://picsum.photos/seed/akk-lighthouse-trail/800/600',
  },
];

function CommunityRouteCard({ r }) {
  const I = window.Icon;
  const { Avatar, ActivityIcon } = window;
  const labelMap = { run: 'Running', bike: 'Ciclismo', trail: 'Trail', mtb: 'MTB' };
  const colorMap = { run: '#FF6E3D', bike: '#5DC9F2', trail: '#C6FF3D', mtb: '#FFB31A' };
  return (
    <div style={{
      flexShrink: 0, scrollSnapAlign: 'start',
      width: 244, borderRadius: 18, overflow: 'hidden',
      background: 'var(--surface)', border: '1px solid var(--line)',
    }}>
      <div style={{
        height: 132, position: 'relative', overflow: 'hidden',
        background: '#000',
      }}>
        <img src={r.img} alt={r.title} loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(0.85) contrast(1.05)' }}
          onError={e => { e.currentTarget.style.display = 'none'; }}/>
        {/* gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 30%, rgba(8,9,11,0.92) 100%)',
        }}/>
        {/* IA badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          fontSize: 9, fontWeight: 700, color: 'var(--green-bright)', letterSpacing: '0.08em',
        }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green-bright)' }} className="pulse-dot"/>
          AI · {labelMap[r.type]}
        </div>
        {/* Kudos */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          fontSize: 11, fontWeight: 700, color: 'var(--text)',
        }}>
          <I name="heart-fill" size={10} color="var(--orange-bright)"/>
          {r.kudos}
        </div>
        {/* Mini route trace */}
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 32, left: 12, right: 12, width: 'calc(100% - 24px)', height: 30, opacity: 0.95 }}>
          <path d="M5 50 Q40 10, 70 30 T130 20 T195 35" fill="none" stroke={colorMap[r.type]} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${colorMap[r.type]})` }}/>
          <circle cx="5" cy="50" r="3" fill="#C6FF3D"/>
          <circle cx="195" cy="35" r="3" fill={colorMap[r.type]}/>
        </svg>
        {/* Title */}
        <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar initials={r.initials} color={r.authorColor} size={28}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.author}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{r.when}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="metric" style={{ fontSize: 14, color: 'var(--text)' }}>{r.km}<span style={{ fontSize: 9, color: 'var(--text-dim)', marginLeft: 2 }}>km</span></div>
          <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>+{r.elev}m · {r.time}</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onStartRoute, onAskAI, user, profile, isNewUser }) {
  const D = window.AKK_DATA;
  const baseU = D.user;
  const u = isNewUser ? {
    ...baseU,
    level: 1, xp: 0, xpToNext: 200, streak: 0,
    weekly: { km: 0, activities: 0, kcal: 0, goal: profile?.weeklyKm || 25 },
    totals: { km: 0, activities: 0, hours: 0, elevation: 0 },
  } : baseU;
  const tier = D.tierForLevel(u.level);
  const xpPct = (u.xp / u.xpToNext) * 100;
  const I = window.Icon;
  const { Avatar, ActivityRow, RingProgress } = window;
  const [weather, setWeather] = React.useState(null);
  const [currentLocation, setCurrentLocation] = React.useState(null); // GPS override
  const [locating, setLocating] = React.useState(false);
  const [portfolioOpen, setPortfolioOpen] = React.useState(false);

  // Registered city from onboarding
  const registeredCity = profile?.city || u.location;
  const locationLabel = currentLocation?.label || registeredCity;
  const activeCoords = currentLocation || profile?.cityCoords || null;

  // Fetch weather whenever active coords change
  React.useEffect(() => {
    if (!window.AKK_TOOLS) return;
    let cancelled = false;
    (async () => {
      try {
        let lat, lng;
        if (activeCoords) { lat = activeCoords.lat; lng = activeCoords.lng; }
        else {
          // No profile coords — geocode the registered city label
          const res = await window.AKK_TOOLS.forwardGeocode(registeredCity);
          if (!res || !res.length) return;
          lat = res[0].lat; lng = res[0].lng;
        }
        const w = await window.AKK_TOOLS.getWeather(lat, lng);
        if (!cancelled) setWeather(w);
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [activeCoords?.lat, activeCoords?.lng, registeredCity]);

  async function useCurrentGPS() {
    setLocating(true);
    if (!navigator.geolocation) { setLocating(false); return; }
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(
        p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
        rej,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      ));
      let label = `${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)}`;
      try {
        const geo = await window.AKK_TOOLS.reverseGeocode(pos.lat, pos.lng);
        if (geo?.label) label = geo.label;
      } catch (e) {}
      setCurrentLocation({ label, ...pos });
    } catch (e) {} finally {
      setLocating(false);
    }
  }
  function resetLocation() { setCurrentLocation(null); }

  const displayName = (user?.name || u.name).split(' ')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const weatherCode = weather?.current?.weather_code;
  const temp = weather?.current?.temperature_2m;
  const isDay = weather?.current?.is_day !== 0;
  const cond = weather ? window.AKK_TOOLS.runningCondition(weather) : null;
  const weeklyGoal = profile?.weeklyKm || u.weekly.goal;

  return (
    <div className="screen screen-in">
      {/* Header */}
      <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials={initials} color={u.avatarColor} size={42} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <I name="location" size={11} /> {locationLabel}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Hola, {displayName}</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: 'rgba(255,77,26,0.12)',
          border: '1px solid rgba(255,77,26,0.3)',
          borderRadius: 999,
        }}>
          <span className="pulse-dot" style={{ color: 'var(--orange-bright)' }}>
            <I name="fire" size={14} />
          </span>
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange-bright)' }}>{u.streak}</span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>días</span>
        </div>
      </div>

      {/* Real-time weather + running condition */}
      {ctx?.weather && (
        <div style={{ padding: '14px 20px 0' }}>
          <div className="card" style={{
            padding: 14, display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(90deg, rgba(255,77,26,0.06), transparent)',
          }}>
            <div style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{window.AKK_TOOLS.weatherIcon(weatherCode, isDay)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="metric" style={{ fontSize: 22, color: 'var(--text)' }}>{Math.round(temp)}°</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{window.AKK_TOOLS.describeWMO(weatherCode)}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                Viento {Math.round(ctx.weather.current.wind_speed_10m)} km/h · Humedad {Math.round(ctx.weather.current.relative_humidity_2m)}%
              </div>
            </div>
            {cond && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="label" style={{ fontSize: 9 }}>PARA CORRER</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: cond.color, marginTop: 2 }}>{cond.label}</div>
              </div>
            )}
          </div>
          {!ctx.real && (
            <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 6, textAlign: 'center' }}>
              Sin permiso de GPS · usando Madrid por defecto
            </div>
          )}
        </div>
      )}

      {/* Level / XP card */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{ padding: 20, position: 'relative' }}>
          {/* glow background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 100% 0%, ${tier.color}22, transparent 60%)`,
            pointerEvents: 'none',
          }}/>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div className="label" style={{ marginBottom: 6, color: tier.color }}>NIVEL · {tier.tier}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="metric" style={{ fontSize: 64, color: 'var(--text)', letterSpacing: '-0.02em' }}>{u.level}</div>
                <div className="metric" style={{ fontSize: 22, color: 'var(--text-faint)' }}>/ 50</div>
              </div>
            </div>
            <RingProgress value={u.xp} max={u.xpToNext} size={72} stroke={6} color={tier.color}>
              <div style={{ textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: tier.color }}>{Math.round((u.xp/u.xpToNext)*100)}%</div>
                <div className="label" style={{ fontSize: 8, marginTop: 1 }}>XP</div>
              </div>
            </RingProgress>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
              <span className="mono" style={{ color: 'var(--text-dim)' }}>{u.xp.toLocaleString('es')} XP</span>
              <span className="mono" style={{ color: 'var(--text-dim)' }}>{u.xpToNext.toLocaleString('es')} XP</span>
            </div>
            <ProgressBar value={u.xp} max={u.xpToNext} />
            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8 }}>
              Faltan <span className="mono" style={{ color: 'var(--orange-bright)', fontWeight: 700 }}>{(u.xpToNext - u.xp).toLocaleString('es')} XP</span> para nivel <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{u.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly stats grid */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="label">Esta semana</div>
          <div className="kbd"><I name="calendar" size={10} /> S22</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
          {/* Weekly KM big */}
          <div className="card" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div className="stripes" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}/>
            <div style={{ position: 'relative' }}>
              <div className="label" style={{ color: 'var(--orange-bright)', marginBottom: 8 }}>KM SEMANA</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <div className="metric" style={{ fontSize: 48, color: 'var(--text)' }}>{u.weekly.km}</div>
                <div className="mono" style={{ fontSize: 14, color: 'var(--text-dim)' }}>/ {weeklyGoal}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <ProgressBar value={u.weekly.km} max={weeklyGoal}/>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div className="stat" style={{ padding: 12 }}>
              <div className="label" style={{ fontSize: 10 }}>Actividades</div>
              <div className="metric" style={{ fontSize: 26, marginTop: 4 }}>{u.weekly.activities}</div>
            </div>
            <div className="stat" style={{ padding: 12 }}>
              <div className="label" style={{ fontSize: 10 }}>Calorías</div>
              <div className="metric" style={{ fontSize: 26, marginTop: 4 }}>{(u.weekly.kcal/1000).toFixed(1)}<span style={{ fontSize: 13, color: 'var(--text-dim)' }}>K</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 20px 0' }}>
        <button onClick={onStartRoute} className="btn btn-primary" style={{ width: '100%' }}>
          <I name="play" size={16} color="#0A0507"/>
          Iniciar ruta
        </button>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }}>
            <I name="bolt" size={14} color="var(--green-bright)"/>
            Quick start
          </button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onStartRoute}>
            <I name="compass" size={14} color="var(--orange-bright)"/>
            Explorar
          </button>
        </div>
      </div>

      {/* Recent activity OR community learning */}
      <div style={{ padding: '8px 20px 0' }}>
        {isNewUser ? (
          <>
            <SectionHead title="Empieza por aquí" right={<span className="kbd" style={{ color: 'var(--green-bright)', borderColor: 'rgba(198,255,61,0.3)', background: 'var(--green-soft)' }}>NUEVO</span>}/>
            <div className="card" style={{ padding: 16, textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,77,26,0.10), transparent 60%)' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px',
                background: 'rgba(255,77,26,0.15)', border: '1px solid rgba(255,77,26,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--orange-bright)',
              }}>
                <I name="bolt" size={28}/>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>¿Listo para tu primera ruta?</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, lineHeight: 1.5 }}>
                Genera una ruta personalizada o aprende de lo que hacen otros runners cerca de ti.
              </div>
              <button onClick={onStartRoute} className="btn" style={{
                padding: '10px 18px', borderRadius: 12,
                background: 'var(--orange)', color: '#0A0507',
                fontWeight: 700, fontSize: 13, letterSpacing: '0.04em',
              }}>
                <I name="play" size={12} color="#0A0507"/>
                Crear mi primera ruta
              </button>
            </div>
          </>
        ) : (
          <>
            <SectionHead title="Actividad reciente" right={<span style={{ fontSize: 12, color: 'var(--orange-bright)', fontWeight: 600 }}>Ver todo</span>}/>
            <div className="card" style={{ padding: '4px 16px' }}>
              {D.activities.slice(0, 3).map(a => <ActivityRow key={a.id} a={a}/>)}
            </div>
          </>
        )}
      </div>

      {/* Aprende de la comunidad — example routes with AI-style photos */}
      <div style={{ padding: '8px 20px 0' }}>
        <SectionHead
          title="Aprende de la comunidad"
          right={<span style={{ fontSize: 12, color: 'var(--orange-bright)', fontWeight: 600 }}>Más</span>}
        />
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory',
          paddingBottom: 4, marginInline: -20, paddingInline: 20,
          scrollbarWidth: 'none',
        }} className="hide-scroll">
          {EXAMPLE_ROUTES.map(r => <CommunityRouteCard key={r.id} r={r}/>)}
        </div>
      </div>

      {/* Daily challenge */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{ padding: 16, background: 'linear-gradient(135deg, #1A1F0A 0%, #14171C 50%)', borderColor: 'rgba(198,255,61,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(198,255,61,0.15)', border: '1px solid rgba(198,255,61,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green-bright)',
            }}>
              <I name="target" size={24}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label" style={{ color: 'var(--green-bright)', marginBottom: 4 }}>RETO DEL DÍA</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>10 km a ritmo libre</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>+250 XP de bonificación</div>
            </div>
            <I name="chevron-right" size={20} color="var(--text-dim)" />
          </div>
        </div>
      </div>

      {/* AI Assistant launcher */}
      {onAskAI && (
        <div style={{ padding: '12px 20px 0' }}>
          <window.AIInlineLauncher onClick={() => onAskAI()}/>
        </div>
      )}
    </div>
  );
}

const SectionHead = window.SectionHead;
const ProgressBar = window.ProgressBar;

window.Dashboard = Dashboard;
