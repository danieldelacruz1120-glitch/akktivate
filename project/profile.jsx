// profile.jsx — Akktivate Profile + Badge Gallery
const { useState: useStateP } = React;

function ProfileScreen({ onLogout, user, profile, isNewUser }) {
  const D = window.AKK_DATA;
  const I = window.Icon;
  const { Avatar, RingProgress, ProgressBar } = window;
  const baseUser = D.user;
  const displayName = user?.name || baseUser.name;
  const initials = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A';
  const email = user?.email || baseUser.handle;
  const registeredCity = profile?.city || 'Madrid · Retiro';
  const [currentLocation, setCurrentLocation] = useStateP(null); // overrides registered if set
  const [locating, setLocating] = useStateP(false);
  const [locError, setLocError] = useStateP(null);
  const cityLabel = currentLocation?.label || registeredCity;
  const u = isNewUser ? {
    ...baseUser, name: displayName, initials,
    level: 1, xp: 0, xpToNext: 200, streak: 0,
    totals: { km: 0, activities: 0, hours: 0, elevation: 0 },
  } : { ...baseUser, name: displayName, initials };
  const tier = D.tierForLevel(u.level);
  const allBadges = D.badges.map(b => isNewUser ? { ...b, unlocked: false } : b);
  const unlocked = allBadges.filter(b => b.unlocked).length;
  const [tab, setTab] = useStateP('logros');
  const [avatarUrl, setAvatarUrl] = useStateP(null);
  const fileInputRef = React.useRef(null);

  function onAvatarClick() {
    fileInputRef.current?.click();
  }

  function onAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
    // Reset so same file can be re-picked
    e.target.value = '';
  }

  function removeAvatar() {
    setAvatarUrl(null);
  }

  async function useGPS() {
    setLocating(true);
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError('Tu navegador no soporta geolocalización');
      setLocating(false);
      return;
    }
    try {
      if (window.AKK_TOOLS) window.AKK_TOOLS.clearCache();
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          err => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
      let label = `${pos.lat.toFixed(3)}, ${pos.lng.toFixed(3)}`;
      try {
        const geo = await window.AKK_TOOLS.reverseGeocode(pos.lat, pos.lng);
        label = geo.label || label;
      } catch (e) {}
      setCurrentLocation({ label, ...pos });
    } catch (err) {
      if (err && err.code === 1) setLocError('Permiso denegado · activa el GPS en los ajustes del navegador');
      else if (err && err.code === 2) setLocError('No se pudo determinar tu ubicación');
      else if (err && err.code === 3) setLocError('Tiempo agotado · intenta de nuevo');
      else setLocError('No se pudo obtener tu ubicación');
    } finally {
      setLocating(false);
    }
  }

  function resetLocation() {
    setCurrentLocation(null);
    setLocError(null);
  }

  return (
    <div className="screen screen-in">
      {/* Profile header */}
      <div style={{ position: 'relative', padding: '20px 20px 0' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 200,
          background: 'radial-gradient(circle at 30% 0%, rgba(255,77,26,0.18), transparent 60%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--line)',
            color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><I name="share" size={16}/></button>
          <button style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--surface)', border: '1px solid var(--line)',
            color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><I name="settings" size={16}/></button>
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarFile} style={{ display: 'none' }}/>
          <div onClick={onAvatarClick} style={{ position: 'relative', cursor: 'pointer' }} title="Cambiar foto de perfil">
            <RingProgress value={u.xp} max={u.xpToNext} size={120} stroke={6} color={tier.color}>
              <Avatar initials={u.initials} color={u.avatarColor} size={100} imageUrl={avatarUrl}/>
            </RingProgress>
            {/* Camera badge */}
            <div style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--orange)', border: '3px solid var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A0507',
              boxShadow: '0 4px 12px rgba(255,77,26,0.5)',
              pointerEvents: 'none',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h3l2-3h8l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          {avatarUrl && (
            <button onClick={removeAvatar} style={{
              marginTop: 8, padding: '4px 12px', borderRadius: 999,
              background: 'transparent', border: '1px solid var(--line)',
              color: 'var(--text-dim)', fontSize: 11, fontWeight: 600,
              cursor: 'pointer',
            }}>Quitar foto</button>
          )}
          <div style={{ marginTop: 14, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>{u.name}</div>
          {email && (
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{email}</div>
          )}

          {/* Location chip + GPS toggle */}
          <div style={{
            marginTop: 10,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 10px 6px 12px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--line)',
          }}>
            <I name="location" size={12} color={currentLocation ? 'var(--green-bright)' : 'var(--orange-bright)'}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cityLabel}</span>
            {currentLocation && (
              <button onClick={resetLocation} style={{
                background: 'transparent', border: 0, color: 'var(--text-faint)',
                cursor: 'pointer', padding: 0, marginLeft: 2, fontSize: 14, lineHeight: 1,
              }} title="Volver a la ubicación de registro">×</button>
            )}
          </div>

          {/* GPS toggle button */}
          <button onClick={useGPS} disabled={locating} className="btn" style={{
            marginTop: 10, padding: '8px 14px', borderRadius: 999,
            background: currentLocation ? 'var(--green-soft)' : 'var(--orange-soft)',
            border: `1px solid ${currentLocation ? 'rgba(198,255,61,0.4)' : 'rgba(255,77,26,0.4)'}`,
            color: currentLocation ? 'var(--green-bright)' : 'var(--orange-bright)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {locating ? (
              <>
                <span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'ringRotate 700ms linear infinite' }}/>
                Buscando…
              </>
            ) : (
              <>
                <I name="target" size={11}/>
                {currentLocation ? 'GPS actual · activo' : 'Usar mi ubicación actual'}
              </>
            )}
          </button>
          {currentLocation && (
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-faint)' }}>
              Registro: <span style={{ color: 'var(--text-dim)' }}>{registeredCity}</span>
            </div>
          )}
          {locError && (
            <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,77,26,0.10)', border: '1px solid rgba(255,77,26,0.3)', fontSize: 11, color: 'var(--orange-bright)', fontWeight: 600, maxWidth: 280, textAlign: 'center', lineHeight: 1.4 }}>
              {locError}
            </div>
          )}

          {/* Level badge */}
          <div style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', borderRadius: 999,
            background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}08)`,
            border: `1px solid ${tier.color}44`,
          }}>
            <div className="metric" style={{ fontSize: 22, color: tier.color }}>{u.level}</div>
            <div style={{ textAlign: 'left' }}>
              <div className="label" style={{ fontSize: 9, color: tier.color }}>NIVEL</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tier.color, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>{tier.tier}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime stats */}
      <div style={{ padding: '24px 20px 0' }}>
        <SectionHead title="Total acumulado"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <LifetimeStat icon="route" label="Distancia" value={u.totals.km.toLocaleString('es')} unit="km" color="var(--orange-bright)"/>
          <LifetimeStat icon="bolt" label="Actividades" value={u.totals.activities} unit="" color="var(--green-bright)"/>
          <LifetimeStat icon="clock" label="Horas" value={u.totals.hours} unit="h" color="#5DC9F2"/>
          <LifetimeStat icon="elev" label="Desnivel" value={(u.totals.elevation/1000).toFixed(1)} unit="km +" color="#FFB31A"/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--line)' }}>
          {[
            ['logros', 'Logros'],
            ['progresion', 'Progresión'],
            ['historial', 'Historial'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="btn" style={{
              padding: '10px 0', borderRadius: 0,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: tab === id ? 'var(--text)' : 'var(--text-faint)',
              borderBottom: tab === id ? '2px solid var(--orange)' : '2px solid transparent',
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'logros' && <BadgesGrid badges={allBadges} unlocked={unlocked}/>}
      {tab === 'progresion' && <ProgressionView u={u} tier={tier} levels={D.LEVELS}/>}
      {tab === 'historial' && <HistoryView activities={isNewUser ? [] : D.activities}/>}

      {/* Logout */}
      <div style={{ padding: '28px 20px 8px' }}>
        <button onClick={onLogout} className="btn" style={{
          width: '100%', height: 48, borderRadius: 14,
          background: 'transparent', border: '1px solid var(--line)',
          color: 'var(--text-dim)', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function LifetimeStat({ icon, label, value, unit, color }) {
  const I = window.Icon;
  return (
    <div className="card" style={{ padding: 14, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -12, right: -12, width: 60, height: 60,
        borderRadius: '50%', background: `${color}10`, pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: color }}>
          <I name={icon} size={14}/>
          <span className="label" style={{ color: 'var(--text-dim)', fontSize: 9 }}>{label}</span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="metric" style={{ fontSize: 30, color: 'var(--text)' }}>{value}</span>
          {unit && <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function BadgesGrid({ badges, unlocked }) {
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="label">Insignias</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          <span style={{ color: 'var(--orange-bright)', fontWeight: 700 }}>{unlocked}</span> / {badges.length}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {badges.map(b => <BadgeMedal key={b.id} b={b}/>)}
      </div>
    </div>
  );
}

function BadgeMedal({ b }) {
  const I = window.Icon;
  const colorMap = {
    flag: '#C6FF3D', fire: '#FF6E3D', milestone: '#5DC9F2', moon: '#9AA0FF',
    rain: '#5DC9F2', sunrise: '#FFB31A', 'milestone-2': '#C6FF3D', mountain: '#FFB31A',
    lightning: '#FFB31A', 'fire-2': '#FF4D1A', ultra: '#E66BFF', everest: '#E6E6FF',
  };
  const c = colorMap[b.icon] || '#FF6E3D';

  return (
    <div className={`medal ${b.unlocked ? 'unlocked' : 'locked'}`}>
      <div style={{
        width: 48, height: 48, borderRadius: 16,
        background: b.unlocked ? `radial-gradient(circle at 30% 30%, ${c}, ${c}66)` : 'var(--surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: b.unlocked ? `0 4px 16px ${c}40, inset 0 -3px 8px rgba(0,0,0,0.3)` : 'none',
        position: 'relative',
      }}>
        <I name={b.icon} size={24} color={b.unlocked ? '#0A0507' : 'var(--text-faint)'}/>
        {b.unlocked && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent 50%)',
            pointerEvents: 'none',
          }}/>
        )}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, textAlign: 'center', color: b.unlocked ? 'var(--text)' : 'var(--text-faint)', lineHeight: 1.15 }}>
        {b.name}
      </div>
      {b.unlocked && <div className="mono" style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }}>{b.date}</div>}
      {!b.unlocked && <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2 }}>Bloqueado</div>}
    </div>
  );
}

function ProgressionView({ u, tier, levels }) {
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="label" style={{ marginBottom: 8 }}>Camino actual</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>Nivel {u.level} · {tier.tier}</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{u.xp.toLocaleString('es')} XP</span>
        </div>
        <ProgressBar value={u.xp} max={u.xpToNext}/>
      </div>

      <div className="label" style={{ marginBottom: 10 }}>Tier roadmap</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {levels.map(L => {
          const isCurrent = u.level >= L.range[0] && u.level <= L.range[1];
          const isPast = u.level > L.range[1];
          return (
            <div key={L.tier} className="card" style={{
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
              borderColor: isCurrent ? L.color + '88' : 'var(--line)',
              background: isCurrent ? `linear-gradient(90deg, ${L.color}14, transparent 60%)` : 'var(--surface)',
              opacity: isPast ? 0.6 : 1,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(135deg, ${L.color}, ${L.color}55)`,
                color: '#0A0507',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display)', fontSize: 16,
                filter: isPast && !isCurrent ? 'grayscale(0.4)' : 'none',
              }}>
                {L.range[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isCurrent ? L.color : 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{L.tier}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Niveles {L.range[0]}{L.range[0] !== L.range[1] ? `–${L.range[1]}` : ''}</div>
              </div>
              {isCurrent && <span className="kbd" style={{ color: L.color, borderColor: `${L.color}66` }}>EN CURSO</span>}
              {isPast && <span className="kbd" style={{ fontSize: 9 }}>✓ HECHO</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistoryView({ activities }) {
  const { ActivityRow } = window;
  const I = window.Icon;
  if (!activities || activities.length === 0) {
    return (
      <div style={{ padding: '16px 20px 0' }}>
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, margin: '0 auto 14px',
            background: 'var(--surface-2)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-faint)',
          }}>
            <I name="route" size={28}/>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Aún no hay actividades</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Tu primera ruta aparecerá aquí.</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div className="card" style={{ padding: '4px 16px' }}>
        {activities.map(a => <ActivityRow key={a.id} a={a}/>)}
      </div>
    </div>
  );
}

const ScreenHeaderInline = ({ title, sub }) => (
  <div style={{ padding: '8px 20px 16px' }}>
    <div className="label" style={{ marginBottom: 4, color: 'var(--orange-bright)' }}>{sub}</div>
    <h1 className="h-display" style={{ margin: 0, fontSize: 42 }}>{title}</h1>
  </div>
);

const SectionHead = window.SectionHead;
const ProgressBar = window.ProgressBar;

window.ProfileScreen = ProfileScreen;
