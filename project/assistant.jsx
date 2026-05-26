// assistant.jsx — Asistente IA flotante con window.claude.complete()
const { useState: useStateAI, useRef: useRefAI, useEffect: useEffectAI } = React;

function buildSystemPrompt(user, ctx) {
  const name = user?.name || 'Atleta';
  const loc = ctx?.geo?.label || 'Madrid';
  const realData = ctx?.real ? 'SÍ' : 'NO (GPS sin permiso)';

  let weatherLine = 'Clima: sin datos.';
  if (ctx?.weather?.current) {
    const c = ctx.weather.current;
    const desc = window.AKK_TOOLS.describeWMO(c.weather_code);
    weatherLine = `Clima ahora: ${desc}, ${Math.round(c.temperature_2m)}°C (sensación ${Math.round(c.apparent_temperature)}°C), viento ${Math.round(c.wind_speed_10m)} km/h, humedad ${Math.round(c.relative_humidity_2m)}%, precipitación ${c.precipitation} mm.`;
  }
  let forecastLine = '';
  if (ctx?.weather?.daily?.temperature_2m_max) {
    const d = ctx.weather.daily;
    forecastLine = `Próximos días: hoy ${Math.round(d.temperature_2m_min[0])}/${Math.round(d.temperature_2m_max[0])}°C lluvia ${d.precipitation_sum[0]}mm; mañana ${Math.round(d.temperature_2m_min[1])}/${Math.round(d.temperature_2m_max[1])}°C lluvia ${d.precipitation_sum[1]}mm.`;
  }
  const now = new Date();
  const hour = now.getHours();

  return `Eres "Akko", el asistente IA de Akktivate, una app deportiva para runners, ciclistas y deportistas de resistencia.

Ayudas con: rutas y zonas para entrenar, planificación de entrenamientos, técnica, nutrición e hidratación, recuperación, prevención de lesiones, material.

Tono: motivador, directo, breve. Habla en español. Frases cortas. Sin emojis. Unidades métricas.

═══ CONTEXTO REAL DEL USUARIO ═══
Nombre: ${name}
Ubicación detectada: ${loc} (datos reales de GPS: ${realData})
Hora local: ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (${hour < 6 ? 'madrugada' : hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche'})
Nivel en la app: 23 "Pacer", racha 18 días, 38.4 km esta semana.

═══ DATOS METEO EN VIVO (Open-Meteo) ═══
${weatherLine}
${forecastLine}

Cuando el usuario pregunte por el clima, condiciones para correr, o "¿puedo salir hoy?", USA ESTOS DATOS reales — no te los inventes.

═══ LIMITACIONES ═══
- No tienes mapas turn-by-turn. Para rutas concretas, redirige al generador de la pestaña "Rutas" de la app.
- No tienes acceso a Strava ni historial detallado del usuario.
- Si te piden algo fuera del deporte, redirige amablemente.`;
}

function AIAssistant({ open, onClose, seedMessages, user }) {
  const I = window.Icon;
  const initialGreeting = `Buenas${user?.name ? ', ' + user.name.split(' ')[0] : ''}. Soy Akko, tu asistente. ¿Qué necesitas para tu próximo entreno?`;
  const [messages, setMessages] = useStateAI(seedMessages || [
    { role: 'assistant', content: initialGreeting },
  ]);
  const [input, setInput] = useStateAI('');
  const [pending, setPending] = useStateAI(false);
  const [ctx, setCtx] = useStateAI(null);
  const scrollRef = useRefAI(null);

  useEffectAI(() => {
    if (open && !ctx && window.AKK_TOOLS) {
      window.AKK_TOOLS.getLocationAndWeather().then(setCtx).catch(() => {});
    }
  }, [open]);

  useEffectAI(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || pending) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setPending(true);

    try {
      const system = buildSystemPrompt(user, ctx);
      const apiMessages = [
        { role: 'user', content: system + '\n\n---\n\nPregunta: ' + q },
        ...next.slice(0, -1).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
        { role: 'user', content: q },
      ];

      const reply = await window.claude.complete({ messages: apiMessages });
      setMessages(m => [...m, { role: 'assistant', content: String(reply).trim() }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Uy, no he podido conectar. Inténtalo de nuevo en un momento.' }]);
    } finally {
      setPending(false);
    }
  }

  const suggestions = [
    '¿Cómo están las condiciones para correr ahora?',
    'Plan de 6 semanas para una media maratón',
    '¿Qué desayunar antes de un rodaje largo?',
    'Técnica para mejorar mi cadencia',
  ];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 200ms ease',
      }}/>

      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        zIndex: 101,
        background: 'var(--bg-elev)',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        border: '1px solid var(--line-strong)',
        borderBottom: 0,
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        animation: 'sheetUp 320ms cubic-bezier(.2,.9,.3,1)',
        height: '88%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 44, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}/>
        </div>

        {/* Header */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--orange), var(--orange-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255,77,26,0.5)',
            position: 'relative', overflow: 'hidden',
          }}>
            <AkkoOrb/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Akko</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 99,
                background: 'var(--green-soft)', border: '1px solid rgba(198,255,61,0.3)',
                fontSize: 9, fontWeight: 700, color: 'var(--green-bright)', letterSpacing: '0.08em',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-bright)' }} className="pulse-dot"/>
                IA
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              {ctx?.weather ? `Conectado · ${ctx.geo?.label || 'GPS'} · ${Math.round(ctx.weather.current.temperature_2m)}°C` : 'Cargando contexto…'}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'var(--surface)', border: '1px solid var(--line)',
            color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            fontSize: 18, lineHeight: 1, paddingBottom: 2,
          }}>×</button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content}/>)}
          {pending && <TypingBubble/>}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="label" style={{ fontSize: 9, padding: '4px 4px 6px' }}>SUGERENCIAS</div>
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                textAlign: 'left',
                padding: '10px 14px', borderRadius: 12,
                background: 'var(--surface)', border: '1px solid var(--line)',
                color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--body)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <I name="bolt" size={12} color="var(--orange-bright)"/>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '12px 16px 18px',
          borderTop: '1px solid var(--line)',
          background: 'var(--bg-elev)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--line)',
            borderRadius: 16, padding: '6px 6px 6px 14px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Pregunta sobre rutas, clima, ritmos…"
              disabled={pending}
              style={{
                flex: 1, background: 'transparent', border: 0, outline: 'none',
                color: 'var(--text)', fontFamily: 'var(--body)', fontSize: 14,
                minWidth: 0, padding: '8px 0',
              }}
            />
            <button onClick={() => send()} disabled={pending || !input.trim()} style={{
              width: 40, height: 40, borderRadius: 12, border: 0,
              background: input.trim() && !pending ? 'var(--orange)' : 'var(--surface-3)',
              color: input.trim() && !pending ? '#0A0507' : 'var(--text-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: pending ? 'wait' : 'pointer', flexShrink: 0,
              transition: 'background 160ms',
            }}>
              <I name="arrow-up" size={18}/>
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 8, textAlign: 'center' }}>
            Akko usa GPS + Open-Meteo en tiempo real. Sin acceso a mapas turn-by-turn.
          </div>
        </div>
      </div>
    </>
  );
}

function Bubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '82%',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'var(--orange)' : 'var(--surface)',
        color: isUser ? '#0A0507' : 'var(--text)',
        border: isUser ? 0 : '1px solid var(--line)',
        fontSize: 14, lineHeight: 1.45,
        fontWeight: isUser ? 600 : 500,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        animation: 'bubbleIn 220ms cubic-bezier(.2,.9,.3,1)',
      }}>
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
      <div style={{
        padding: '14px 16px', borderRadius: '18px 18px 18px 4px',
        background: 'var(--surface)', border: '1px solid var(--line)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--orange-bright)',
            animation: 'typingDot 1.2s ease-in-out infinite', animationDelay: (i * 0.18) + 's',
          }}/>
        ))}
      </div>
    </div>
  );
}

function AkkoOrb() {
  // Animated AI orb glyph
  return (
    <svg viewBox="0 0 40 40" width="28" height="28">
      <defs>
        <radialGradient id="akkoOrb" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
          <stop offset="40%" stopColor="#FFD8C2" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#0A0507" stopOpacity="0.4"/>
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="13" fill="url(#akkoOrb)"/>
      <circle cx="20" cy="20" r="13" fill="none" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.6">
        <animate attributeName="r" values="13;15;13" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// Floating action button
function AIFAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 16, bottom: 110, zIndex: 50,
      width: 56, height: 56, borderRadius: 18,
      background: 'linear-gradient(135deg, var(--orange-bright), var(--orange-deep))',
      border: '1px solid rgba(255,255,255,0.12)',
      color: '#0A0507',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(255,77,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
      cursor: 'pointer',
      animation: 'fabPulse 3s ease-in-out infinite',
    }}>
      <AkkoOrb/>
    </button>
  );
}

// Inline launcher (used in route card etc.)
function AIInlineLauncher({ onClick, label = 'Pregúntale a Akko' }) {
  const I = window.Icon;
  return (
    <button onClick={onClick} className="btn" style={{
      width: '100%', padding: '14px 16px', borderRadius: 16,
      background: 'linear-gradient(90deg, rgba(255,77,26,0.10), rgba(198,255,61,0.05))',
      border: '1px solid rgba(255,77,26,0.25)',
      color: 'var(--text)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'linear-gradient(135deg, var(--orange), var(--orange-deep))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 12px rgba(255,77,26,0.5)',
        flexShrink: 0,
      }}><AkkoOrb/></div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>Asistente IA · Rutas, ritmos, técnica</div>
      </div>
      <I name="chevron-right" size={16} color="var(--text-dim)"/>
    </button>
  );
}

// Inject AI keyframes once
if (!document.getElementById('akk-ai-keyframes')) {
  const st = document.createElement('style');
  st.id = 'akk-ai-keyframes';
  st.textContent = [
    '@keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }',
    '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    '@keyframes bubbleIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }',
    '@keyframes typingDot { 0%, 60%, 100% { opacity: 0.3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }',
    '@keyframes fabPulse { 0%, 100% { box-shadow: 0 8px 24px rgba(255,77,26,0.5), inset 0 1px 0 rgba(255,255,255,0.3); } 50% { box-shadow: 0 8px 30px rgba(255,77,26,0.8), inset 0 1px 0 rgba(255,255,255,0.4); } }',
  ].join('\n');
  document.head.appendChild(st);
}

window.AIAssistant = AIAssistant;
window.AIFAB = AIFAB;
window.AIInlineLauncher = AIInlineLauncher;
