// Icons.jsx — Akktivate SVG icons (stroke-based, energetic feel)
const Icon = ({ name, size = 22, color = "currentColor", strokeWidth = 2, style }) => {
  const s = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style };
  const stroke = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z" {...stroke}/></svg>;
    case "route":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="6" cy="6" r="2.5" {...stroke}/><circle cx="18" cy="18" r="2.5" {...stroke}/><path d="M6 9v4a4 4 0 004 4h2a4 4 0 014 4" {...stroke}/></svg>;
    case "community":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="9" cy="8" r="3.5" {...stroke}/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" {...stroke}/><circle cx="17" cy="9" r="2.5" {...stroke}/><path d="M15 20c0-2.8 2-5 4-5s2 0 2 0" {...stroke}/></svg>;
    case "user":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="8" r="4" {...stroke}/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" {...stroke}/></svg>;
    case "play":
      return <svg viewBox="0 0 24 24" style={s}><path d="M7 5l12 7-12 7z" fill={color}/></svg>;
    case "fire":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 3s4 4 4 8a4 4 0 11-8 0c0-1.5 1-2.5 1-2.5S8 11 8 13a4 4 0 008 0c0-5-4-10-4-10z" fill={color}/></svg>;
    case "bolt":
      return <svg viewBox="0 0 24 24" style={s}><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill={color}/></svg>;
    case "run":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="17" cy="4" r="2" fill={color}/><path d="M14 8l-3 4 4 2v6M11 12L7 11l-2 4M15 14l3 4" {...stroke}/></svg>;
    case "bike":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="6" cy="17" r="4" {...stroke}/><circle cx="18" cy="17" r="4" {...stroke}/><path d="M6 17l4-7h5l3 7M10 10l-2-4h-2M15 10l-1-3" {...stroke}/></svg>;
    case "trail":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 20l5-9 3 5 3-7 7 11z" {...stroke}/><circle cx="16" cy="6" r="2" fill={color}/></svg>;
    case "mtb":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="5" cy="17" r="3.5" {...stroke}/><circle cx="19" cy="17" r="3.5" {...stroke}/><path d="M5 17l4-8 7 1 3 7M9 9l-1-3h-2" {...stroke}/></svg>;
    case "location":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" {...stroke}/><circle cx="12" cy="9" r="2.5" {...stroke}/></svg>;
    case "elev":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 19l6-9 4 6 4-4 4 7z" {...stroke}/></svg>;
    case "clock":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...stroke}/><path d="M12 7v5l3 2" {...stroke}/></svg>;
    case "trophy":
      return <svg viewBox="0 0 24 24" style={s}><path d="M8 4h8v5a4 4 0 11-8 0V4z" {...stroke}/><path d="M8 6H5v2a3 3 0 003 3M16 6h3v2a3 3 0 01-3 3M10 14h4v3h-4zM8 21h8" {...stroke}/></svg>;
    case "chevron-right":
      return <svg viewBox="0 0 24 24" style={s}><path d="M9 6l6 6-6 6" {...stroke}/></svg>;
    case "chevron-down":
      return <svg viewBox="0 0 24 24" style={s}><path d="M6 9l6 6 6-6" {...stroke}/></svg>;
    case "heart":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" {...stroke}/></svg>;
    case "heart-fill":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" fill={color}/></svg>;
    case "share":
      return <svg viewBox="0 0 24 24" style={s}><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 3v12M7 8l5-5 5 5" {...stroke}/></svg>;
    case "settings":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...stroke}/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8L4.2 7.1A2 2 0 117 4.3l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" {...stroke}/></svg>;
    case "plus":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14" {...stroke}/></svg>;
    case "minus":
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14" {...stroke}/></svg>;
    case "calendar":
      return <svg viewBox="0 0 24 24" style={s}><rect x="4" y="5" width="16" height="16" rx="2" {...stroke}/><path d="M4 9h16M9 3v4M15 3v4" {...stroke}/></svg>;
    case "target":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...stroke}/><circle cx="12" cy="12" r="5" {...stroke}/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>;
    case "search":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="7" {...stroke}/><path d="M16 16l5 5" {...stroke}/></svg>;
    case "compass":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...stroke}/><path d="M15.5 8.5L13 13l-4.5 2.5L11 11z" fill={color} stroke="none"/></svg>;
    case "flag":
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 21V4l9 3-3 3 3 3-9-3" {...stroke}/></svg>;
    case "kcal":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 3s5 5 5 10a5 5 0 11-10 0c0-2 1-3 1-3s0 2 2 2 2-3 0-5c1.5.5 2-4 2-4z" fill={color} stroke="none"/></svg>;
    case "wind":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 8h13a3 3 0 100-6M3 14h17a3 3 0 110 6M3 11h9" {...stroke}/></svg>;
    case "weather":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="8" cy="10" r="3" {...stroke}/><path d="M11 17h7a3 3 0 100-6h-1" {...stroke}/></svg>;
    case "moon":
      return <svg viewBox="0 0 24 24" style={s}><path d="M20 14A8 8 0 1110 4a6 6 0 0010 10z" fill={color} stroke="none"/></svg>;
    case "sunrise":
      return <svg viewBox="0 0 24 24" style={s}><path d="M4 18h16M7 14a5 5 0 0110 0M12 4v3M5 8l2 2M19 8l-2 2" {...stroke}/></svg>;
    case "mountain":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 20l6-11 4 7 3-4 5 8z" {...stroke}/></svg>;
    case "milestone":
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 21V3M5 5h11l-2 3 2 3H5" {...stroke}/></svg>;
    case "milestone-2":
      return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...stroke}/><path d="M8 12l2 2 6-6" {...stroke}/></svg>;
    case "lightning":
      return <svg viewBox="0 0 24 24" style={s}><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill={color} stroke="none"/></svg>;
    case "ultra":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" {...stroke}/></svg>;
    case "everest":
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 20l5-11 3 5 2-3 3 5 5 4z" {...stroke}/><path d="M8 9l1-2 1 2" {...stroke}/></svg>;
    case "rain":
      return <svg viewBox="0 0 24 24" style={s}><path d="M6 12a4 4 0 014-4 5 5 0 019.6 1A3 3 0 1118 14h-8a4 4 0 01-4-4" {...stroke}/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" {...stroke}/></svg>;
    case "fire-2":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 2c1 5 7 6 7 12a7 7 0 11-14 0c0-3 2-5 2-5s0 2 2 2 1-3 1-5 2-4 2-4z" fill={color} stroke="none"/></svg>;
    case "arrow-up":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 19V5M5 12l7-7 7 7" {...stroke}/></svg>;
    case "arrow-down":
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12l7 7 7-7" {...stroke}/></svg>;
    case "dash":
      return <svg viewBox="0 0 24 24" style={s}><path d="M6 12h12" {...stroke}/></svg>;
    case "logo":
      // Use the real bitmap logo if available, else fallback SVG
      if (window.AKK_LOGO_URL) {
        return <img src={window.AKK_LOGO_URL} alt="Akktivate" style={{ ...s, objectFit: 'contain' }}/>;
      }
      return (
        <svg viewBox="0 0 100 60" style={s}>
          <path d="M5 55 L30 8 L48 8 L42 18 L55 18 L60 28 L48 28 L43 38 L62 38 L52 55 Z" fill={color}/>
          <path d="M58 8 L72 8 L72 28 L88 8 L100 8 L82 32 L100 55 L85 55 L72 36 L72 55 L58 55 Z" fill={color}/>
        </svg>
      );
    default:
      return null;
  }
};

window.Icon = Icon;

// Logo asset
window.AKKLogo = ({ size = 56 }) => {
  if (window.AKK_LOGO_URL) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(255,77,26,0.4), 0 6px 20px rgba(255,77,26,0.3)',
      }}>
        <img src={window.AKK_LOGO_URL} alt="Akktivate" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}/>
      </div>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 0 1px rgba(255,77,26,0.4), 0 6px 20px rgba(255,77,26,0.3)'
    }}>
      <Icon name="logo" size={size * 0.7} color="#FF4D1A" />
    </div>
  );
};
