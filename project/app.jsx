// app.jsx — Akktivate main shell
const { useState: useAppState, useEffect: useAppEffect } = React;

function PhoneFrame({ children }) {
  // Custom dark phone frame
  const w = 393, h = 852;
  return (
    <div style={{
      width: w, height: h, borderRadius: 56,
      background: '#000',
      padding: 10,
      boxShadow:
        '0 50px 100px rgba(0,0,0,0.5),' +
        '0 0 0 1px rgba(255,255,255,0.04),' +
        'inset 0 0 0 1px rgba(255,255,255,0.06)',
      position: 'relative',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 46,
        background: 'var(--bg)', overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 54,
          padding: '20px 32px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 30, pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: '-apple-system, "SF Pro", system-ui',
            fontWeight: 600, fontSize: 16, color: '#fff',
          }}>9:41</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* signal */}
            <svg width="17" height="11" viewBox="0 0 17 11">
              <rect x="0" y="7" width="3" height="4" rx="0.5" fill="#fff"/>
              <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="#fff"/>
              <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="#fff"/>
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="#fff"/>
            </svg>
            {/* wifi */}
            <svg width="16" height="11" viewBox="0 0 16 11">
              <path d="M8 3C10 3 11.8 3.8 13.2 5L14.2 4C12.5 2.3 10.3 1.3 8 1.3C5.7 1.3 3.5 2.3 1.8 4L2.8 5C4.2 3.8 6 3 8 3Z" fill="#fff"/>
              <path d="M8 6.2C9.3 6.2 10.3 6.7 11.2 7.5L12.2 6.5C11 5.3 9.6 4.7 8 4.7C6.4 4.7 5 5.3 3.8 6.5L4.8 7.5C5.7 6.7 6.7 6.2 8 6.2Z" fill="#fff"/>
              <circle cx="8" cy="9.5" r="1.3" fill="#fff"/>
            </svg>
            {/* battery */}
            <svg width="26" height="12" viewBox="0 0 26 12">
              <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="#fff" strokeOpacity="0.4" fill="none"/>
              <rect x="2" y="2" width="14" height="8" rx="1.5" fill="var(--orange-bright)"/>
              <path d="M24 4.5V7.5C24.5 7.3 25 6.7 25 6C25 5.3 24.5 4.7 24 4.5Z" fill="#fff" fillOpacity="0.5"/>
            </svg>
          </div>
        </div>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 122, height: 35, borderRadius: 22, background: '#000', zIndex: 40,
        }}/>
        {children}
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 6, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none',
        }}>
          <div style={{ width: 134, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.4)' }}/>
        </div>
      </div>
    </div>
  );
}

function DesktopBackdrop() {
  return (
    <>
      <div style={{
        position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 12,
        zIndex: 1,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#000', border: '1px solid rgba(255,77,26,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <window.Icon name="logo" size={22} color="#FF4D1A"/>
        </div>
        <div>
          <div className="h-display" style={{ fontSize: 18, color: '#fff', letterSpacing: '0.03em' }}>AKKTIVATE</div>
          <div className="label" style={{ fontSize: 9, color: 'var(--orange-bright)', marginTop: -2 }}>HI-FI · PROTOTIPO</div>
        </div>
      </div>
      <div style={{
        position: 'fixed', bottom: 24, right: 24, fontSize: 11, color: 'rgba(255,255,255,0.3)',
        fontFamily: 'var(--mono)', letterSpacing: '0.04em',
      }}>
        ⌨ Cambia de pantalla con los tabs · 🗺 Mueve el slider para regenerar la ruta
      </div>
    </>
  );
}

function App() {
  const [tab, setTab] = useAppState('home');
  const [transitioning, setTransitioning] = useAppState(false);
  const [authed, setAuthed] = useAppState(false);
  const [aiOpen, setAiOpen] = useAppState(false);
  const [aiSeed, setAiSeed] = useAppState(null);
  const [user, setUser] = useAppState(null); // { name, email, provider }
  const [profile, setProfile] = useAppState(null); // onboarding answers
  const [needsOnboarding, setNeedsOnboarding] = useAppState(false);

  function changeTab(next) {
    if (next === tab) return;
    setTransitioning(true);
    setTimeout(() => { setTab(next); setTransitioning(false); }, 120);
  }

  function logout() {
    setAuthed(false);
    setUser(null);
    setProfile(null);
    setNeedsOnboarding(false);
    setTab('home');
    if (window.AKK_TOOLS) window.AKK_TOOLS.clearCache();
  }

  function handleAuth(info) {
    setUser(info);
    setAuthed(true);
    // Only ask onboarding on new account creation (signup or google) — not on sign-in
    if (info && info.skipOnboarding) {
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
  }

  // A user is "new" when they signed up (not signed in) — fresh level 1, 0 XP
  const isNewUser = authed && user && !user.skipOnboarding;

  function handleOnboardingDone(answers) {
    setProfile(answers); // null means skipped
    setNeedsOnboarding(false);
  }

  function openAI(seed) {
    setAiSeed(seed || null);
    setAiOpen(true);
  }

  const { Dashboard, RoutesScreen, CommunityScreen, ProfileScreen, TabBar, AuthScreen, AIAssistant, AIFAB, OnboardingScreen } = window;

  return (
    <>
      <DesktopBackdrop/>
      <PhoneFrame>
        {!authed ? (
          <AuthScreen onAuth={handleAuth}/>
        ) : needsOnboarding ? (
          <OnboardingScreen user={user} onDone={handleOnboardingDone}/>
        ) : (
          <div className="app-root">
            <div key={tab} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', opacity: transitioning ? 0 : 1, transition: 'opacity 120ms ease', overflow: 'hidden' }}>
              {tab === 'home' && <Dashboard user={user} profile={profile} isNewUser={isNewUser} onStartRoute={() => changeTab('routes')} onAskAI={openAI}/>}
              {tab === 'routes' && <RoutesScreen profile={profile} onAskAI={openAI}/>}
              {tab === 'community' && <CommunityScreen user={user} profile={profile}/>}
              {tab === 'profile' && <ProfileScreen user={user} profile={profile} isNewUser={isNewUser} onLogout={logout}/>}
            </div>
            <TabBar active={tab} onChange={changeTab}/>
            {!aiOpen && <AIFAB onClick={() => openAI()}/>}
            <AIAssistant open={aiOpen} onClose={() => setAiOpen(false)} seedMessages={aiSeed} user={user} profile={profile}/>
          </div>
        )}
      </PhoneFrame>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
