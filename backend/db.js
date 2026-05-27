const { createClient } = require('@libsql/client');

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./akktivate.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ── Query helpers ─────────────────────────────────────────────────

async function getOne(sql, args = []) {
  const r = await db.execute({ sql, args });
  return r.rows[0] || null;
}

async function getAll(sql, args = []) {
  const r = await db.execute({ sql, args });
  return r.rows;
}

async function run(sql, args = []) {
  const r = await db.execute({ sql, args });
  return { lastInsertRowid: Number(r.lastInsertRowid || 0), changes: r.rowsAffected || 0 };
}

// ── Database initialisation ───────────────────────────────────────

async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'email',
      avatar_url TEXT,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      xp_to_next INTEGER DEFAULT 600,
      streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      total_km REAL DEFAULT 0,
      total_activities INTEGER DEFAULT 0,
      total_hours REAL DEFAULT 0,
      total_elevation INTEGER DEFAULT 0,
      weekly_km REAL DEFAULT 0,
      weekly_activities INTEGER DEFAULT 0,
      weekly_kcal INTEGER DEFAULT 0,
      week_iso TEXT,
      location TEXT DEFAULT '',
      location_lat REAL DEFAULT 0,
      location_lng REAL DEFAULT 0,
      activity_type TEXT DEFAULT 'run',
      level_exp TEXT DEFAULT 'rookie',
      weekly_km_goal INTEGER DEFAULT 25,
      goal TEXT DEFAULT 'disfrute',
      preferred_time TEXT DEFAULT 'manana',
      join_community INTEGER DEFAULT 1,
      notifications INTEGER DEFAULT 1,
      last_login TEXT,
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
}

// ── Pure helpers ──────────────────────────────────────────────────

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
  if (days < 7) return `${days} dias`;
  return `${Math.round(days / 7)} sem`;
}

// ── Async DB helpers ──────────────────────────────────────────────

async function applyXP(userId, xpEarned) {
  const user = await getOne('SELECT level, xp, xp_to_next FROM users WHERE id = ?', [userId]);
  let level = Number(user.level);
  let xp = Number(user.xp) + xpEarned;
  let xp_to_next = Number(user.xp_to_next);
  let leveledUp = false;
  while (xp >= xp_to_next && level < 50) {
    xp -= xp_to_next;
    level++;
    xp_to_next = xpToNextLevel(level);
    leveledUp = true;
  }
  if (level >= 50) xp = Math.min(xp, xp_to_next - 1);
  await run('UPDATE users SET xp = ?, level = ?, xp_to_next = ? WHERE id = ?', [xp, level, xp_to_next, userId]);
  return { newLevel: level, newXp: xp, xpToNext: xp_to_next, leveledUp };
}

async function updateStreak(userId) {
  const user = await getOne('SELECT streak, last_active_date FROM users WHERE id = ?', [userId]);
  const today = new Date().toISOString().slice(0, 10);
  const last = user.last_active_date;
  let streak = Number(user.streak);

  if (last === today) return streak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  streak = (last === yesterday) ? streak + 1 : 1;

  await run('UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?', [streak, today, userId]);
  return streak;
}

async function ensureWeeklyReset(userId) {
  const currentWeek = isoWeek(new Date().toISOString());
  const user = await getOne('SELECT week_iso FROM users WHERE id = ?', [userId]);
  if (user && user.week_iso !== currentWeek) {
    await run(
      'UPDATE users SET weekly_km=0, weekly_activities=0, weekly_kcal=0, week_iso=? WHERE id=?',
      [currentWeek, userId],
    );
  }
}

const BADGE_CHECKS = [
  { id: 'b1',  check: (u) => Number(u.total_activities) >= 1 },
  { id: 'b2',  check: (u) => Number(u.streak) >= 7 },
  { id: 'b3',  check: (u) => Number(u.total_km) >= 100 },
  { id: 'b7',  check: (u) => Number(u.total_km) >= 1000 },
  { id: 'b10', check: (u) => Number(u.streak) >= 30 },
];

async function checkAndAwardBadges(userId) {
  const user = await getOne('SELECT * FROM users WHERE id = ?', [userId]);
  const awardedRows = await getAll('SELECT id FROM badges WHERE user_id = ?', [userId]);
  const awarded = awardedRows.map(r => r.id);
  const newBadges = [];
  for (const badge of BADGE_CHECKS) {
    if (!awarded.includes(badge.id) && badge.check(user)) {
      try { await run('INSERT OR IGNORE INTO badges (id, user_id) VALUES (?,?)', [badge.id, userId]); } catch (e) {}
      newBadges.push(badge.id);
    }
  }
  return newBadges;
}

async function checkActivityBadges(userId, activity) {
  const awardedRows = await getAll('SELECT id FROM badges WHERE user_id = ?', [userId]);
  const awarded = new Set(awardedRows.map(r => r.id));
  const newBadges = [];

  const maybeMark = async (id) => {
    if (!awarded.has(id)) {
      awarded.add(id);
      try { await run('INSERT OR IGNORE INTO badges (id, user_id) VALUES (?,?)', [id, userId]); } catch (e) {}
      newBadges.push(id);
    }
  };

  const hour = new Date(activity.created_at || Date.now()).getHours();
  if (hour >= 22 || hour < 5) await maybeMark('b4');
  if (hour < 6) await maybeMark('b6');
  if (Number(activity.elevation) >= 1000) await maybeMark('b8');
  if (Number(activity.km) >= 42) await maybeMark('b11');
  if ((activity.type === 'run' || activity.type === 'trail') &&
      Number(activity.km) >= 5 && activity.duration_secs / activity.km < 240) {
    await maybeMark('b9');
  }

  return newBadges;
}

module.exports = {
  db,
  getOne,
  getAll,
  run,
  initDb,
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
