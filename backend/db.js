const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'akktivate.db'));

// Performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    provider TEXT DEFAULT 'email',
    avatar_url TEXT,

    -- Progresión
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_to_next INTEGER DEFAULT 600,
    streak INTEGER DEFAULT 0,
    last_active_date TEXT,

    -- Totales acumulados
    total_km REAL DEFAULT 0,
    total_activities INTEGER DEFAULT 0,
    total_hours REAL DEFAULT 0,
    total_elevation INTEGER DEFAULT 0,

    -- Stats semanales (se resetean cada lunes)
    weekly_km REAL DEFAULT 0,
    weekly_activities INTEGER DEFAULT 0,
    weekly_kcal INTEGER DEFAULT 0,
    week_iso TEXT,

    -- Onboarding / preferencias
    location TEXT DEFAULT 'Madrid · Retiro',
    location_lat REAL DEFAULT 40.4153,
    location_lng REAL DEFAULT -3.6843,
    activity_type TEXT DEFAULT 'run',
    level_exp TEXT DEFAULT 'rookie',
    weekly_km_goal INTEGER DEFAULT 25,
    goal TEXT DEFAULT 'disfrute',
    preferred_time TEXT DEFAULT 'mañana',
    join_community INTEGER DEFAULT 1,
    notifications INTEGER DEFAULT 1,

    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('run','bike','trail','mtb')),
    title TEXT NOT NULL,
    km REAL NOT NULL,
    duration_secs INTEGER NOT NULL,
    pace TEXT,
    elevation INTEGER DEFAULT 0,
    kcal INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'medio',
    kudos_count INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS kudos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(activity_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unlocked_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (id, user_id)
  );
`);

// ── Helpers ──────────────────────────────────────────────────────

const DIFF_MULT = { facil: 0.85, medio: 1.0, duro: 1.18, pro: 1.4 };

function calcXP(km, difficulty = 'medio') {
  return Math.round(km * 30 * (DIFF_MULT[difficulty] || 1.0));
}

function xpToNextLevel(level) {
  return 500 + level * 100;
}

function isoWeek(dateStr) {
  const d = new Date(dateStr || Date.now());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
}

function formatPace(km, secs, type) {
  if (type === 'bike' || type === 'mtb') {
    const kmh = km / (secs / 3600);
    return `${kmh.toFixed(1)} km/h`;
  }
  const secsPerKm = secs / km;
  const mins = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${mins}:${String(s).padStart(2, '0')}`;
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function relativeDate(isoStr) {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diffSecs = (now - then) / 1000;
  if (diffSecs < 3600) return `${Math.round(diffSecs / 60)} min`;
  if (diffSecs < 86400) return `${Math.round(diffSecs / 3600)} h`;
  if (diffSecs < 172800) return 'Ayer';
  const days = Math.round(diffSecs / 86400);
  if (days < 7) return `${days} días`;
  return `${Math.round(days / 7)} sem`;
}

// Aplica XP y sube de nivel si corresponde
function applyXP(userId, xpEarned) {
  const user = db.prepare('SELECT level, xp, xp_to_next FROM users WHERE id = ?').get(userId);
  let { level, xp, xp_to_next } = user;
  xp += xpEarned;
  let leveledUp = false;
  while (xp >= xp_to_next && level < 50) {
    xp -= xp_to_next;
    level++;
    xp_to_next = xpToNextLevel(level);
    leveledUp = true;
  }
  if (level >= 50) xp = Math.min(xp, xp_to_next - 1);
  db.prepare('UPDATE users SET xp = ?, level = ?, xp_to_next = ? WHERE id = ?')
    .run(xp, level, xp_to_next, userId);
  return { newLevel: level, newXp: xp, xpToNext: xp_to_next, leveledUp };
}

// Actualiza racha (llamar una vez por actividad)
function updateStreak(userId) {
  const user = db.prepare('SELECT streak, last_active_date FROM users WHERE id = ?').get(userId);
  const today = new Date().toISOString().slice(0, 10);
  const last = user.last_active_date;
  let streak = user.streak;

  if (last === today) return streak; // ya contabilizado hoy

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === yesterday) {
    streak++;
  } else {
    streak = 1;
  }
  db.prepare('UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?').run(streak, today, userId);
  return streak;
}

// Resetea stats semanales si es una semana nueva
function ensureWeeklyReset(userId) {
  const currentWeek = isoWeek(new Date().toISOString());
  const user = db.prepare('SELECT week_iso FROM users WHERE id = ?').get(userId);
  if (user.week_iso !== currentWeek) {
    db.prepare('UPDATE users SET weekly_km=0, weekly_activities=0, weekly_kcal=0, week_iso=? WHERE id=?')
      .run(currentWeek, userId);
  }
}

// Comprueba insignias y las desbloquea si aplica
const BADGE_CHECKS = [
  {
    id: 'b1', name: 'Primera Ruta',
    check: (u) => u.total_activities >= 1,
  },
  {
    id: 'b2', name: 'Racha 7 Días',
    check: (u) => u.streak >= 7,
  },
  {
    id: 'b3', name: '100 KM',
    check: (u) => u.total_km >= 100,
  },
  {
    id: 'b7', name: '1000 KM',
    check: (u) => u.total_km >= 1000,
  },
  {
    id: 'b10', name: 'Racha 30 Días',
    check: (u) => u.streak >= 30,
  },
];

function checkAndAwardBadges(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const awarded = db.prepare('SELECT id FROM badges WHERE user_id = ?')
    .all(userId).map(r => r.id);
  const newBadges = [];
  for (const badge of BADGE_CHECKS) {
    if (!awarded.includes(badge.id) && badge.check(user)) {
      db.prepare('INSERT OR IGNORE INTO badges (id, user_id) VALUES (?,?)').run(badge.id, userId);
      newBadges.push(badge.id);
    }
  }
  return newBadges;
}

// Comprueba insignias dependientes de la actividad (nocturno, lluvia, madrugador, subida, velocista, ultra)
function checkActivityBadges(userId, activity) {
  const awarded = db.prepare('SELECT id FROM badges WHERE user_id = ?')
    .all(userId).map(r => r.id);
  const newBadges = [];
  const hour = new Date(activity.created_at || Date.now()).getHours();

  const maybeMark = (id) => {
    if (!awarded.includes(id)) {
      db.prepare('INSERT OR IGNORE INTO badges (id, user_id) VALUES (?,?)').run(id, userId);
      newBadges.push(id);
    }
  };

  if (hour >= 22 || hour < 5) maybeMark('b4');        // Nocturno
  if (hour < 6) maybeMark('b6');                       // Madrugador
  if (activity.elevation >= 1000) maybeMark('b8');     // Subida Bestia
  if (activity.km >= 42) maybeMark('b11');             // Ultra

  // Velocista: ritmo < 4:00/km y distancia >= 5km
  if ((activity.type === 'run' || activity.type === 'trail') &&
      activity.km >= 5 && activity.duration_secs / activity.km < 240) {
    maybeMark('b9');
  }

  return newBadges;
}

module.exports = {
  db,
  calcXP,
  xpToNextLevel,
  formatPace,
  formatDuration,
  relativeDate,
  applyXP,
  updateStreak,
  ensureWeeklyReset,
  checkAndAwardBadges,
  checkActivityBadges,
  isoWeek,
};
