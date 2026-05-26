// ui.jsx — Shared UI primitives for Akktivate
const { useState, useEffect, useRef, useMemo } = React;
const Icon = window.Icon;

// ── ActivityChip — colored pill ────────────────────────────────
function ActivityIcon({ type, size = 18, color }) {
  const map = { run: "run", bike: "bike", trail: "trail", mtb: "mtb" };
  return <Icon name={map[type] || "run"} size={size} color={color || "currentColor"} />;
}

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ initials, color = "#FF4D1A", size = 40, border = false, imageUrl }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: imageUrl ? '#000' : `linear-gradient(135deg, ${color}, ${shade(color, -30)})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--display)', fontSize: size * 0.42, color: '#0A0507',
      letterSpacing: '0.04em',
      border: border ? '2px solid var(--bg)' : 'none',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {imageUrl ? (
        <img src={imageUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
      ) : initials}
    </div>
  );
}
function shade(hex, amt) {
  // simple darken/lighten
  const c = hex.replace('#','');
  const num = parseInt(c, 16);
  let r = (num >> 16) + amt; let g = ((num >> 8) & 0xff) + amt; let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

// ── ProgressBar with shimmer ───────────────────────────────────
function ProgressBar({ value, max = 100, color = "var(--orange)", height = 8 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-track" style={{ height }}>
      <div className="progress-fill" style={{ width: pct + '%' }} />
    </div>
  );
}

// ── RingProgress ───────────────────────────────────────────────
function RingProgress({ value, max = 100, size = 64, stroke = 6, color = "var(--orange)", trackColor = "rgba(255,255,255,0.08)", children }) {
  const pct = Math.min(1, value / max);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(.2,.9,.3,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ── Stat ───────────────────────────────────────────────────────
function Stat({ icon, label, value, unit, accent = "var(--orange-bright)" }) {
  return (
    <div className="stat">
      <div className="stat-icon" style={{ color: accent }}>
        <Icon name={icon} size={18} />
      </div>
      <div className="label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div className="metric" style={{ fontSize: 30, color: 'var(--text)' }}>{value}</div>
        {unit && <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{unit}</div>}
      </div>
    </div>
  );
}

// ── ScreenHeader ───────────────────────────────────────────────
function ScreenHeader({ title, action, sub }) {
  return (
    <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        {sub && <div className="label" style={{ marginBottom: 6, color: 'var(--orange-bright)' }}>{sub}</div>}
        <h1 className="h-display" style={{ margin: 0, fontSize: 38, color: 'var(--text)' }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

// ── SectionHead ────────────────────────────────────────────────
function SectionHead({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', margin: '24px 0 12px', gap: 12 }}>
      <div className="label" style={{ color: 'var(--text-dim)' }}>{title}</div>
      <div style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{right}</div>
    </div>
  );
}

// ── Bottom Tab Bar ─────────────────────────────────────────────
function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'routes', label: 'Rutas', icon: 'route' },
    { id: 'community', label: 'Comunidad', icon: 'community' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
  ];
  return (
    <nav className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={active === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Kudos button (animated) ────────────────────────────────────
function KudosButton({ count: initial, liked: initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initial);
  const [burst, setBurst] = useState(0);

  function toggle() {
    if (liked) { setLiked(false); setCount(c => c - 1); }
    else { setLiked(true); setCount(c => c + 1); setBurst(b => b + 1); }
  }

  return (
    <button onClick={toggle} className="btn" style={{
      gap: 6, padding: '6px 12px', borderRadius: 999,
      background: liked ? 'var(--orange-soft)' : 'var(--surface-2)',
      border: `1px solid ${liked ? 'rgba(255,77,26,0.4)' : 'var(--line)'}`,
      color: liked ? 'var(--orange-bright)' : 'var(--text-dim)',
      fontSize: 13, fontWeight: 700,
      position: 'relative',
    }}>
      <span style={{
        position: 'relative', display: 'inline-flex',
        transform: liked ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 240ms cubic-bezier(.34,1.56,.64,1)'
      }}>
        <Icon name={liked ? "heart-fill" : "heart"} size={14} />
        {burst > 0 && (
          <span key={burst} style={{
            position: 'absolute', inset: 0,
            animation: 'kudosBurst 600ms ease-out forwards',
            pointerEvents: 'none',
          }}>
            <Icon name="heart-fill" size={14} color="var(--orange-bright)"/>
          </span>
        )}
      </span>
      <span className="mono">{count}</span>
    </button>
  );
}

// Add kudosBurst keyframes
if (!document.getElementById('akk-extra-keyframes')) {
  const st = document.createElement('style');
  st.id = 'akk-extra-keyframes';
  st.textContent = `
    @keyframes kudosBurst {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes activityPing {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.6); opacity: 0; }
    }
    @keyframes drift {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(st);
}

// ── ActivityRow ────────────────────────────────────────────────
function ActivityRow({ a, compact = false }) {
  const colorMap = { run: '#FF6E3D', bike: '#5DC9F2', trail: '#C6FF3D', mtb: '#FFB31A' };
  const labelMap = { run: 'Running', bike: 'Ciclismo', trail: 'Trail', mtb: 'MTB' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: colorMap[a.type] || 'var(--orange-bright)',
        flexShrink: 0,
      }}>
        <ActivityIcon type={a.type} size={22} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 2, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>{labelMap[a.type]}</span>
          <span>·</span>
          <span>{a.date}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="metric" style={{ fontSize: 20, color: 'var(--text)' }}>{a.km}<span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 3 }}>km</span></div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.time}</div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  Avatar, ActivityIcon, ProgressBar, RingProgress, Stat, ScreenHeader, SectionHead,
  TabBar, KudosButton, ActivityRow,
});
