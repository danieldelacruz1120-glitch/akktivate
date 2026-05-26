// auth.jsx — Welcome / Sign in / Sign up
const { useState: useStateAuth } = React;

function AuthScreen({ onAuth }) {
  const I = window.Icon;
  const [view, setView] = useStateAuth('welcome'); // welcome | signin | signup
  const [email, setEmail] = useStateAuth('');
  const [pwd, setPwd] = useStateAuth('');
  const [name, setName] = useStateAuth('');
  const [loading, setLoading] = useStateAuth(false);
  const [googleLoading, setGoogleLoading] = useStateAuth(false);

  function submit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const finalName = name.trim() || (email.split('@')[0] || 'Atleta');
      const display = finalName.charAt(0).toUpperCase() + finalName.slice(1);
      // Sign-in = existing user, skip onboarding. Sign-up = new user, show onboarding.
      onAuth({ name: display, email: email.trim(), skipOnboarding: view === 'signin' });
    }, 850);
  }

  function googleAuth() {
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      onAuth({ name: 'Daniel', email: 'daniel@gmail.com', provider: 'google' });
    }, 1100);
  }

  if (view === 'welcome') return <WelcomeView onSignIn={() => setView('signin')} onSignUp={() => setView('signup')} onGuest={() => onAuth({ name: 'Invitado', email: '' })} onGoogle={googleAuth} googleLoading={googleLoading}/>;

  const isSignup = view === 'signup';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg)',
      padding: '54px 24px 24px',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      animation: 'screenIn 280ms cubic-bezier(.2,.9,.3,1)',
    }}>
      {/* Back */}
      <button onClick={() => setView('welcome')} className="btn" style={{
        alignSelf: 'flex-start', marginTop: 8,
        width: 40, height: 40, borderRadius: 12,
        background: 'var(--surface)', border: '1px solid var(--line)',
        color: 'var(--text)', flexShrink: 0,
      }}>
        <I name="chevron-right" size={18} style={{ transform: 'rotate(180deg)' }}/>
      </button>

      {/* Header */}
      <div style={{ marginTop: 36 }}>
        <div className="label" style={{ color: 'var(--orange-bright)', marginBottom: 14 }}>{isSignup ? 'NUEVA CUENTA' : 'BIENVENIDO DE VUELTA'}</div>
        <h1 className="h-display" style={{ margin: 0, fontSize: 42, lineHeight: 0.95 }}>
          {isSignup ? <>Únete a la<br/><span style={{ color: 'var(--orange-bright)' }}>manada</span></> : <>Vuelve a la<br/><span style={{ color: 'var(--orange-bright)' }}>manada</span></>}
        </h1>
      </div>

      {/* Form */}
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {isSignup && (
          <Field label="Nombre" icon="user" value={name} onChange={setName} placeholder="Tu nombre"/>
        )}
        <Field label="Email" icon="weather" value={email} onChange={setEmail} placeholder="tu@email.com" type="email"/>
        <Field label="Contraseña" icon="bolt" value={pwd} onChange={setPwd} placeholder="••••••••" type="password"/>
        {!isSignup && (
          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <a href="#" style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>¿Has olvidado tu contraseña?</a>
          </div>
        )}
      </div>

      {/* CTA */}
      <button onClick={submit} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: 32 }}>
        {loading ? (
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid rgba(10,5,7,0.3)', borderTopColor: '#0A0507',
            animation: 'ringRotate 700ms linear infinite',
          }}/>
        ) : (
          <>
            <I name="bolt" size={14} color="#0A0507"/>
            {isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
          </>
        )}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 20px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
        <span className="label" style={{ fontSize: 10 }}>O CONTINÚA CON</span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
      </div>

      <button onClick={googleAuth} disabled={googleLoading} className="btn" style={{
        width: '100%', height: 56, borderRadius: 16,
        background: '#fff', color: '#1F1F1F',
        fontSize: 15, fontWeight: 700,
        gap: 12,
      }}>
        {googleLoading ? (
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#1F1F1F',
            animation: 'ringRotate 700ms linear infinite',
          }}/>
        ) : (
          <>
            <GoogleG/>
            Continuar con Google
          </>
        )}
      </button>

      {/* Footer */}
      <div style={{ marginTop: 28, marginBottom: 8, textAlign: 'center', fontSize: 13, color: 'var(--text-dim)' }}>
        {isSignup ? '¿Ya tienes cuenta?' : '¿Eres nuevo?'}{' '}
        <a onClick={() => setView(isSignup ? 'signin' : 'signup')} style={{ color: 'var(--orange-bright)', fontWeight: 700, cursor: 'pointer' }}>
          {isSignup ? 'Inicia sesión' : 'Crea una cuenta'}
        </a>
      </div>
    </div>
  );
}

function Field({ label, icon, value, onChange, placeholder, type = 'text' }) {
  const I = window.Icon;
  return (
    <div>
      <div className="label" style={{ fontSize: 10, marginBottom: 8 }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 14, padding: '0 14px', height: 54,
      }}>
        <I name={icon} size={16} color="var(--text-faint)"/>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, background: 'transparent', border: 0, outline: 'none',
            color: 'var(--text)', fontFamily: 'var(--body)', fontSize: 15, fontWeight: 600,
            minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.5 4.2-5.5 7.2-10.3 7.2-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.1-5.1C34.2 7.5 29.4 5.6 24 5.6 13.8 5.6 5.6 13.8 5.6 24S13.8 42.4 24 42.4 42.4 34.2 42.4 24c0-1.2-.1-2.3-.3-3.5z"/>
      <path fill="#FF3D00" d="M7.7 14.4l5.9 4.3c1.6-3.9 5.4-6.7 9.9-6.7 2.8 0 5.4 1.1 7.3 2.8l5.1-5.1C32.6 6.6 28.5 5 24 5 17 5 11 9 7.7 14.4z"/>
      <path fill="#4CAF50" d="M24 43c4.5 0 8.6-1.5 11.7-4.2l-5.4-4.6c-1.7 1.2-3.9 2-6.3 2-4.8 0-8.8-3-10.3-7.1L7.8 33.2C11 38.9 17 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.7 2-2 3.7-3.7 4.9l5.4 4.6c-.4.3 5.7-4.2 5.7-13.1 0-1.2-.1-2.3-.3-3.5z"/>
    </svg>
  );
}

function WelcomeView({ onSignIn, onSignUp, onGuest, onGoogle, googleLoading }) {
  const I = window.Icon;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--bg)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,77,26,0.30), transparent 60%),' +
          'radial-gradient(ellipse 50% 30% at 30% 50%, rgba(198,255,61,0.10), transparent 60%),' +
          'var(--bg)',
        pointerEvents: 'none',
      }}/>
      {/* Stripes */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 280, height: 280,
        backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,77,26,0.10) 0, rgba(255,77,26,0.10) 4px, transparent 4px, transparent 16px)',
        transform: 'rotate(15deg)',
        pointerEvents: 'none',
        opacity: 0.6,
      }}/>

      {/* Top status spacing */}
      <div style={{ height: 70 }}/>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '0 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Logo big — uses real bitmap */}
        <div style={{ marginTop: 28 }}>
          <window.AKKLogo size={88}/>
        </div>

        {/* Type */}
        <div style={{ marginTop: 36 }}>
          <div className="label" style={{ color: 'var(--green-bright)', marginBottom: 16, fontSize: 10 }}>RUNNING · CICLISMO · TRAIL · MTB</div>
          <h1 className="h-display" style={{ margin: 0, fontSize: 54, letterSpacing: '0.02em', lineHeight: 0.94 }}>
            Activa tu<br/>
            <span style={{ color: 'var(--orange-bright)' }}>siguiente</span><br/>
            kilómetro.
          </h1>
        </div>

        {/* Pulses + stats teaser */}
        <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Rutas IA', icon: 'compass' },
            { label: 'XP & niveles', icon: 'bolt' },
            { label: 'Comunidad local', icon: 'community' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 99,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
              fontSize: 12, fontWeight: 600, color: 'var(--text-dim)',
            }}>
              <I name={t.icon} size={13} color="var(--orange-bright)"/>
              {t.label}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 32 }}/>

        {/* Buttons */}
        <button onClick={onSignUp} className="btn btn-primary" style={{ width: '100%' }}>
          <I name="bolt" size={16} color="#0A0507"/>
          Crear cuenta
        </button>
        <button onClick={onSignIn} className="btn" style={{
          width: '100%', height: 52, marginTop: 12, borderRadius: 16,
          background: 'transparent', border: '1px solid var(--line-strong)',
          color: 'var(--text)', fontSize: 14, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>
          Iniciar sesión
        </button>

        {/* Google */}
        <button onClick={onGoogle} disabled={googleLoading} className="btn" style={{
          width: '100%', height: 52, marginTop: 12, borderRadius: 16,
          background: '#fff', color: '#1F1F1F',
          fontSize: 14, fontWeight: 700, gap: 10,
        }}>
          {googleLoading ? (
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#1F1F1F',
              animation: 'ringRotate 700ms linear infinite',
            }}/>
          ) : (
            <>
              <GoogleG/>
              Continuar con Google
            </>
          )}
        </button>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <a onClick={onGuest} style={{ color: 'var(--text-faint)', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' }}>
            Continuar como invitado →
          </a>
        </div>
        <div style={{ marginTop: 14, marginBottom: 8, fontSize: 10, color: 'var(--text-faint)', textAlign: 'center', lineHeight: 1.6 }}>
          Al continuar aceptas los <span style={{ color: 'var(--text-dim)' }}>Términos</span> y la <span style={{ color: 'var(--text-dim)' }}>Política de privacidad</span>.
        </div>
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;
