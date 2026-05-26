const express = require('express');
const { db } = require('../db');
const requireAuth = require('../middleware/auth');
const { safeUser } = require('./auth');

const router = express.Router();

// GET /api/user/me — perfil completo del usuario autenticado
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const badges = db.prepare('SELECT id, unlocked_at FROM badges WHERE user_id = ?').all(req.user.userId);

  res.json({ user: safeUser(user), badges });
});

// PUT /api/user/me — actualiza nombre, avatar_url, etc.
router.put('/me', requireAuth, (req, res) => {
  const allowed = ['name', 'avatar_url', 'location', 'location_lat', 'location_lng',
    'weekly_km_goal', 'notifications', 'join_community', 'activity_type'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
  }
  const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`)
    .run(...Object.values(updates), req.user.userId);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
  res.json({ user: safeUser(user) });
});

// POST /api/user/onboarding — guarda respuestas del onboarding tras registro
router.post('/onboarding', requireAuth, (req, res) => {
  const {
    city, cityCoords, activity, level, weeklyKm,
    goal, preferredTime, joinCommunity, notifications,
  } = req.body;

  db.prepare(`
    UPDATE users SET
      location = ?,
      location_lat = ?,
      location_lng = ?,
      activity_type = ?,
      level_exp = ?,
      weekly_km_goal = ?,
      goal = ?,
      preferred_time = ?,
      join_community = ?,
      notifications = ?
    WHERE id = ?
  `).run(
    city || 'Madrid · Retiro',
    cityCoords?.lat ?? 40.4153,
    cityCoords?.lng ?? -3.6843,
    activity || 'run',
    level || 'rookie',
    weeklyKm || 25,
    goal || 'disfrute',
    preferredTime || 'mañana',
    joinCommunity ? 1 : 0,
    notifications ? 1 : 0,
    req.user.userId,
  );

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
  res.json({ user: safeUser(user) });
});

// GET /api/user/badges — todas las insignias (desbloqueadas y bloqueadas)
router.get('/badges', requireAuth, (req, res) => {
  const ALL_BADGES = [
    { id: 'b1',  name: 'Primera Ruta',  icon: 'flag',        desc: 'Completa tu primera actividad' },
    { id: 'b2',  name: 'Racha 7 Días',  icon: 'fire',        desc: '7 días seguidos activo' },
    { id: 'b3',  name: '100 KM',         icon: 'milestone',   desc: '100 km acumulados' },
    { id: 'b4',  name: 'Nocturno',       icon: 'moon',        desc: 'Ruta entre 22:00 y 05:00' },
    { id: 'b5',  name: 'Bajo la Lluvia', icon: 'rain',        desc: 'Termina con lluvia activa' },
    { id: 'b6',  name: 'Madrugador',     icon: 'sunrise',     desc: 'Empieza antes de las 06:00' },
    { id: 'b7',  name: '1000 KM',        icon: 'milestone-2', desc: '1.000 km acumulados' },
    { id: 'b8',  name: 'Subida Bestia',  icon: 'mountain',    desc: '+1000 m de desnivel positivo' },
    { id: 'b9',  name: 'Velocista',      icon: 'lightning',   desc: 'Ritmo bajo 4:00 /km en 5K' },
    { id: 'b10', name: 'Racha 30 Días',  icon: 'fire-2',      desc: '30 días seguidos activo' },
    { id: 'b11', name: 'Ultra',           icon: 'ultra',       desc: 'Más de 42 km en una salida' },
    { id: 'b12', name: 'Everesting',      icon: 'everest',     desc: '+8.848 m acumulados' },
  ];

  const unlocked = db.prepare('SELECT id, unlocked_at FROM badges WHERE user_id = ?')
    .all(req.user.userId);
  const unlockedMap = Object.fromEntries(unlocked.map(b => [b.id, b.unlocked_at]));

  const badges = ALL_BADGES.map(b => ({
    ...b,
    unlocked: !!unlockedMap[b.id],
    date: unlockedMap[b.id] ? new Date(unlockedMap[b.id]).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric',
    }) : null,
  }));

  res.json({ badges });
});

module.exports = router;
