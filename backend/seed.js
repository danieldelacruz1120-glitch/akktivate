// seed.js — Pobla la base de datos con los datos demo del prototipo
// Uso: node seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { db, calcXP, xpToNextLevel, formatPace, formatDuration } = require('./db');

const DEMO_USERS = [
  { name: 'Marco Aller',   email: 'marco@akktivate.com',  password: 'akktivate123', level: 23, xp: 14820, streak: 18, location: 'Madrid · Retiro',   lat: 40.4153, lng: -3.6843, color_idx: 0 },
  { name: 'Lucía Vega',    email: 'lucia@akktivate.com',  password: 'akktivate123', level: 18, xp: 8200,  streak: 12, location: 'Madrid · Manzanares', lat: 40.4020, lng: -3.7110, color_idx: 1 },
  { name: 'David Roca',    email: 'david@akktivate.com',  password: 'akktivate123', level: 21, xp: 11500, streak: 9,  location: 'Madrid · Chamartín', lat: 40.4590, lng: -3.6810, color_idx: 2 },
  { name: 'Ane Pardo',     email: 'ane@akktivate.com',    password: 'akktivate123', level: 31, xp: 19000, streak: 22, location: 'Madrid · Cuerda Larga', lat: 40.7500, lng: -3.9600, color_idx: 3 },
  { name: 'Iván Soler',    email: 'ivan@akktivate.com',   password: 'akktivate123', level: 15, xp: 6100,  streak: 5,  location: 'Madrid · Casa de Campo', lat: 40.4183, lng: -3.7580, color_idx: 0 },
  { name: 'Núria Camps',   email: 'nuria@akktivate.com',  password: 'akktivate123', level: 19, xp: 9400,  streak: 14, location: 'Madrid · Retiro',   lat: 40.4153, lng: -3.6843, color_idx: 5 },
];

const DEMO_ACTIVITIES = [
  { userIdx: 0, type: 'run',   title: 'Casa de Campo Loop',         km: 8.4,  secs: 2538, elev: 124, difficulty: 'medio', hoursAgo: 3 },
  { userIdx: 0, type: 'bike',  title: 'Sierra Norte Climb',          km: 32.1, secs: 5090, elev: 720, difficulty: 'duro',  hoursAgo: 27 },
  { userIdx: 0, type: 'trail', title: 'Pinar de las Siete Tetas',    km: 12.6, secs: 4122, elev: 380, difficulty: 'medio', hoursAgo: 51 },
  { userIdx: 0, type: 'run',   title: 'Madrid Río Tempo',            km: 6.0,  secs: 1656, elev: 32,  difficulty: 'facil', hoursAgo: 75 },
  { userIdx: 1, type: 'run',   title: 'Sunset along Manzanares',     km: 10.2, secs: 2931, elev: 28,  difficulty: 'medio', hoursAgo: 1 },
  { userIdx: 2, type: 'bike',  title: 'Puerto de Navacerrada',        km: 64.8, secs: 9972, elev: 980, difficulty: 'duro',  hoursAgo: 2 },
  { userIdx: 3, type: 'trail', title: 'Cuerda Larga FKT',            km: 24.5, secs: 11520, elev: 1320, difficulty: 'pro',  hoursAgo: 4 },
  { userIdx: 4, type: 'mtb',   title: 'Casa de Campo singletrack',   km: 18.3, secs: 4449, elev: 240, difficulty: 'duro',  hoursAgo: 6 },
  { userIdx: 5, type: 'run',   title: 'Intervalos 6×800',            km: 7.4,  secs: 2042, elev: 12,  difficulty: 'duro',  hoursAgo: 22 },
  { userIdx: 1, type: 'bike',  title: 'Ruta Colmenar',               km: 45.0, secs: 7200, elev: 540, difficulty: 'medio', hoursAgo: 48 },
  { userIdx: 2, type: 'run',   title: 'Parque del Retiro 10K',       km: 10.0, secs: 2700, elev: 35,  difficulty: 'medio', hoursAgo: 72 },
  { userIdx: 3, type: 'trail', title: 'Montaña palentina',            km: 18.0, secs: 7800, elev: 850, difficulty: 'duro',  hoursAgo: 120 },
];

const DEMO_KUDOS = [
  // [activityIdx, userIdx]
  [4, 0], [4, 2], [4, 3],
  [5, 0], [5, 3], [5, 4],
  [6, 0], [6, 1], [6, 2], [6, 4], [6, 5],
  [7, 0], [7, 1],
  [8, 0], [8, 2], [8, 3],
];

const DEMO_BADGES = [
  { userId_idx: 0, badges: ['b1','b2','b3','b4','b5','b6','b7','b8'] },
  { userId_idx: 1, badges: ['b1','b2','b3','b6'] },
  { userId_idx: 2, badges: ['b1','b2','b3'] },
  { userId_idx: 3, badges: ['b1','b2','b3','b4','b5','b6','b7','b8','b10','b11'] },
  { userId_idx: 4, badges: ['b1','b2'] },
  { userId_idx: 5, badges: ['b1','b2','b3','b6'] },
];

async function seed() {
  console.log('🌱 Iniciando seed de Akktivate...\n');

  // Clear existing data
  db.exec(`
    DELETE FROM kudos;
    DELETE FROM badges;
    DELETE FROM activities;
    DELETE FROM users;
  `);
  console.log('✓ Tablas vaciadas');

  // Insert users
  const userIds = [];
  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    const res = db.prepare(`
      INSERT INTO users (name, email, password_hash, level, xp, xp_to_next, streak, location, location_lat, location_lng,
        activity_type, level_exp, weekly_km_goal, join_community,
        total_km, total_activities, total_hours, total_elevation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'run', 'avanzado', 40, 1, 0, 0, 0, 0)
    `).run(u.name, u.email, hash, u.level, u.xp, xpToNextLevel(u.level), u.streak,
      u.location, u.lat, u.lng);
    userIds.push(res.lastInsertRowid);
    console.log(`✓ Usuario: ${u.name} (${u.email})`);
  }

  // Insert activities
  const activityIds = [];
  for (const a of DEMO_ACTIVITIES) {
    const userId = userIds[a.userIdx];
    const createdAt = new Date(Date.now() - a.hoursAgo * 3600 * 1000).toISOString();
    const pace = formatPace(a.km, a.secs, a.type);
    const kcal = Math.round(a.km * 70 * (a.type === 'run' ? 1.1 : a.type === 'trail' ? 1.2 : 0.65));
    const xpEarned = calcXP(a.km, a.difficulty);

    const res = db.prepare(`
      INSERT INTO activities (user_id, type, title, km, duration_secs, pace, elevation, kcal, xp_earned, difficulty, is_public, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(userId, a.type, a.title, a.km, a.secs, pace, a.elev, kcal, xpEarned, a.difficulty, createdAt);
    activityIds.push(res.lastInsertRowid);

    // Update user totals
    db.prepare(`
      UPDATE users SET
        total_km = total_km + ?,
        total_activities = total_activities + 1,
        total_hours = total_hours + ?,
        total_elevation = total_elevation + ?,
        weekly_km = weekly_km + ?,
        weekly_activities = weekly_activities + 1,
        weekly_kcal = weekly_kcal + ?
      WHERE id = ?
    `).run(a.km, a.secs / 3600, a.elev, a.km, kcal, userId);
  }
  console.log(`✓ ${DEMO_ACTIVITIES.length} actividades creadas`);

  // Insert kudos
  for (const [actIdx, userIdx] of DEMO_KUDOS) {
    const actId = activityIds[actIdx];
    const userId = userIds[userIdx];
    if (!actId || !userId) continue;
    try {
      db.prepare('INSERT INTO kudos (activity_id, user_id) VALUES (?,?)').run(actId, userId);
      db.prepare('UPDATE activities SET kudos_count = kudos_count + 1 WHERE id = ?').run(actId);
    } catch {}
  }
  console.log(`✓ Kudos asignados`);

  // Insert badges
  for (const entry of DEMO_BADGES) {
    const userId = userIds[entry.userId_idx];
    for (const badgeId of entry.badges) {
      const daysAgo = Math.floor(Math.random() * 60 + 10);
      const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
      db.prepare('INSERT OR IGNORE INTO badges (id, user_id, unlocked_at) VALUES (?,?,?)').run(badgeId, userId, date);
    }
  }
  console.log(`✓ Insignias asignadas`);

  console.log('\n✅ Seed completado. Usuarios de prueba:');
  console.log('   📧 marco@akktivate.com     🔑 akktivate123  (Nivel 23 · Pacer)');
  console.log('   📧 lucia@akktivate.com     🔑 akktivate123');
  console.log('   📧 ane@akktivate.com       🔑 akktivate123  (Nivel 31 · Endurance)');
  console.log('\n   Inicia el servidor: npm run dev\n');
}

// Si se ejecuta directamente (node seed.js), salir al terminar
if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  });
} else {
  // Si se importa desde server.js, exportar la función
  module.exports = seed;
  seed().catch(err => console.error('❌ Error en auto-seed:', err.message));
}
