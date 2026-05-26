// community.jsx — Akktivate Community Feed + Ranking
const { useState: useCStateCM } = React;

function CommunityScreen({ user }) {
  const D = window.AKK_DATA;
  const I = window.Icon;
  const { Avatar, KudosButton, ActivityIcon } = window;
  const [tab, setTab] = useCStateCM('feed');

  return (
    <div className="screen screen-in">
      <ScreenHeaderInline title="Comunidad" sub="ZONA · MADRID"/>

      {/* Segmented control */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--surface)', borderRadius: 12, padding: 4,
          border: '1px solid var(--line)',
        }}>
          {['feed', 'ranking'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="btn" style={{
              height: 36, borderRadius: 9,
              background: tab === t ? 'var(--surface-3)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-dim)',
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}>{t === 'feed' ? 'Feed' : 'Ranking'}</button>
          ))}
        </div>
      </div>

      {tab === 'feed' ? <FeedView/> : <RankingView user={user}/>}
    </div>
  );
}

function FeedView() {
  const D = window.AKK_DATA;
  const I = window.Icon;
  const { Avatar, KudosButton, ActivityIcon } = window;

  const colorMap = { run: '#FF6E3D', bike: '#5DC9F2', trail: '#C6FF3D', mtb: '#FFB31A' };
  const labelMap = { run: 'Running', bike: 'Ciclismo', trail: 'Trail', mtb: 'MTB' };

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Live activity banner */}
      <div className="card" style={{
        padding: 12, display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(90deg, rgba(198,255,61,0.10), transparent)',
        borderColor: 'rgba(198,255,61,0.25)'
      }}>
        <div style={{ position: 'relative', width: 32, height: 32 }}>
          <div className="pulse-dot" style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(198,255,61,0.3)',
          }}/>
          <div style={{
            position: 'absolute', inset: 8, borderRadius: '50%',
            background: 'var(--green-bright)',
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>3 amigos están corriendo ahora</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Lucía, David y Núria</div>
        </div>
        <I name="chevron-right" size={16} color="var(--text-dim)"/>
      </div>

      {D.community.map(act => (
        <article key={act.id} className="card" style={{ padding: 16 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar initials={act.initials} color={act.color} size={40}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.user}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-dim)', marginTop: 1, whiteSpace: 'nowrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: colorMap[act.type], fontWeight: 700,
                }}>
                  <ActivityIcon type={act.type} size={11} color={colorMap[act.type]}/>
                  {labelMap[act.type]}
                </span>
                <span>·</span>
                <span>{act.when}</span>
              </div>
            </div>
            <button style={{
              width: 28, height: 28, borderRadius: 8, background: 'transparent',
              border: 0, color: 'var(--text-dim)', cursor: 'pointer',
            }}>···</button>
          </div>

          {/* Title */}
          <div className="h-display" style={{ fontSize: 22, marginTop: 12, color: 'var(--text)' }}>{act.title}</div>

          {/* Mini map preview */}
          <MiniMap type={act.type} seed={act.id}/>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginTop: 12 }}>
            <MetricMini label="Distancia" value={act.km} unit="km"/>
            <MetricMini label="Tiempo" value={act.time}/>
            <MetricMini label={act.type === 'bike' || act.type === 'mtb' ? "Vel. media" : "Ritmo"} value={act.pace}/>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <KudosButton count={act.kudos} liked={act.liked}/>
            <button className="btn" style={{
              gap: 6, padding: '6px 12px', borderRadius: 999,
              background: 'var(--surface-2)', border: '1px solid var(--line)',
              color: 'var(--text-dim)', fontSize: 13, fontWeight: 600,
            }}>
              <I name="share" size={12}/>
              <span>Compartir</span>
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-faint)' }}>
              <Avatar initials="JM" color="#5DC9F2" size={18}/>
              <Avatar initials="EL" color="#FFB31A" size={18}/>
              <span style={{ marginLeft: 4 }}>+{Math.floor(act.kudos * 0.3)}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function RankingView({ user }) {
  const D = window.AKK_DATA;
  const I = window.Icon;
  const { Avatar } = window;
  const initialsFrom = n => (n || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'YO';
  const ranking = D.ranking.map(r => r.isMe ? { ...r, user: user?.name || r.user, initials: initialsFrom(user?.name || r.user) } : r);
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Banner */}
      <div className="card" style={{
        padding: 16, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(255,77,26,0.15), rgba(255,179,26,0.06))',
        borderColor: 'rgba(255,77,26,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <I name="trophy" size={28} color="var(--orange-bright)"/>
          <div>
            <div className="label" style={{ color: 'var(--orange-bright)' }}>Ranking semanal · Madrid</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>Termina en 2d 14h · Top 3 reciben badge</div>
          </div>
        </div>
      </div>

      {/* Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: 8, alignItems: 'flex-end', marginBottom: 16 }}>
        {[
          { ...podium[1], height: 80 },
          { ...podium[0], height: 110 },
          { ...podium[2], height: 64 },
        ].map((p, i) => (
          <PodiumColumn key={p.user} p={p} place={p.rank}/>
        ))}
      </div>

      {/* Rest list */}
      <div className="card" style={{ padding: '4px 16px' }}>
        {rest.map(r => (
          <div key={r.user} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
            borderBottom: '1px solid var(--line)',
            background: r.isMe ? 'rgba(255,77,26,0.06)' : 'transparent',
            marginInline: r.isMe ? -16 : 0,
            paddingInline: r.isMe ? 16 : 0,
            borderLeft: r.isMe ? '2px solid var(--orange)' : 0,
          }}>
            <div className="metric" style={{ width: 24, textAlign: 'center', fontSize: 20, color: r.isMe ? 'var(--orange-bright)' : 'var(--text-faint)' }}>
              {r.rank}
            </div>
            <Avatar initials={r.initials} color={r.color} size={38}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {r.user}
                {r.isMe && <span className="kbd" style={{ padding: '2px 6px', fontSize: 9, color: 'var(--orange-bright)', borderColor: 'rgba(255,77,26,0.4)' }}>TÚ</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: r.change > 0 ? 'var(--green-bright)' : r.change < 0 ? 'var(--orange-bright)' : 'var(--text-faint)' }}>
                <I name={r.change > 0 ? "arrow-up" : r.change < 0 ? "arrow-down" : "dash"} size={11}/>
                {r.change === 0 ? '— igual' : `${Math.abs(r.change)} posición${Math.abs(r.change) > 1 ? 'es' : ''}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="metric" style={{ fontSize: 20 }}>{r.km}</div>
              <div className="label" style={{ fontSize: 9 }}>KM</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumColumn({ p, place }) {
  const { Avatar } = window;
  const I = window.Icon;
  const colors = { 1: '#FFB31A', 2: '#9AA0AB', 3: '#FF6E3D' };
  const heightMap = { 1: 100, 2: 76, 3: 60 };
  const c = colors[place];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        {place === 1 && (
          <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', color: c }}>
            <I name="trophy" size={16}/>
          </div>
        )}
        <div style={{ border: `2px solid ${c}`, borderRadius: '50%', padding: 2 }}>
          <Avatar initials={p.initials} color={p.color} size={48}/>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap' }}>
        {p.user.split(' ')[0]}
      </div>
      <div className="metric" style={{ fontSize: 18, color: c }}>{p.km}<span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 2 }}>km</span></div>
      <div style={{
        width: '100%', height: heightMap[place],
        background: `linear-gradient(180deg, ${c}33, ${c}05)`,
        border: `1px solid ${c}44`,
        borderRadius: '12px 12px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="metric" style={{ fontSize: 36, color: c }}>{place}</div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, unit }) {
  return (
    <div style={{ borderRight: '1px solid var(--line)' }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div style={{ marginTop: 4 }}>
        <span className="metric" style={{ fontSize: 18 }}>{value}</span>
        {unit && <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

function MiniMap({ type, seed }) {
  // Generate a deterministic squiggly mini-map preview
  const colorMap = { run: '#FF6E3D', bike: '#5DC9F2', trail: '#C6FF3D', mtb: '#FFB31A' };
  const c = colorMap[type] || '#FF6E3D';
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => { h = (h * 9301 + 49297) % 233280; return h / 233280; };
  const pts = [[20, 60]];
  let x = 20, y = 60;
  for (let i = 0; i < 14; i++) {
    x = Math.max(20, Math.min(300, x + 16 + rand() * 12));
    y = Math.max(15, Math.min(105, y + (rand() - 0.5) * 30));
    pts.push([x, y]);
  }
  const d = pts.reduce((acc, [px, py], i) => acc + (i === 0 ? `M${px},${py}` : ` L${px},${py}`), '');
  return (
    <div style={{
      marginTop: 12, height: 110, borderRadius: 12, overflow: 'hidden',
      background: 'linear-gradient(135deg, #0B0D11, #14171C)',
      border: '1px solid var(--line)',
      position: 'relative',
    }}>
      <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%' }}>
        <defs>
          <pattern id={`grid-${seed}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0H0V14" fill="none" stroke="rgba(255,255,255,0.04)"/>
          </pattern>
        </defs>
        <rect width="320" height="120" fill={`url(#grid-${seed})`}/>
        <path d={d} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
        <circle cx={pts[0][0]} cy={pts[0][1]} r="5" fill="#C6FF3D"/>
        <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="5" fill={c}/>
      </svg>
    </div>
  );
}

const ScreenHeaderInline = ({ title, sub }) => (
  <div style={{ padding: '8px 20px 16px' }}>
    <div className="label" style={{ marginBottom: 4, color: 'var(--orange-bright)' }}>{sub}</div>
    <h1 className="h-display" style={{ margin: 0, fontSize: 42 }}>{title}</h1>
  </div>
);

window.CommunityScreen = CommunityScreen;
