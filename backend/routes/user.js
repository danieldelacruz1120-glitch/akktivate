const express = require('express');
const { getOne, getAll, run } = require('../db');
const requireAuth = require('../middleware/auth');
const { safeUser } = require('./auth');

const router = express.Router();

// GET /api/user/me — perfil completo del usuario autenticado
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await getOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const badges = await getAll('SELECT id, unlocked_at FROM badges WHERE user_id = ?', [req.user.userId]);
    res.json({ user: safeUser(user), badges });
  } catch (err) {
    console.error('GET /me error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/me — actualiza nombre, avatar_url, etc.
router.put('/me', requireAuth, async (req, res) => {
  try {
    const allowed = ['name', 'avatar_url', 'location', 'location_lat', 'location_lng',
      'weekly_km_goal', 'notifications', 'join_community', 'activity_type'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No hay campos validos para actualizar' });
    }
    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), req.user.userId],
    );
    const user = await getOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('PUT /me error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/onboarding — guarda respuestas del onboarding tras registro
router.post('/onboarding', requireAuth, async (req, res) => {
  try {
    const {
      city, cityCoords, activity, level, weeklyKm,
      goal, preferredTime, joinCommunity, notifications,
    } = req.body;

    await run(`
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
    `, [
      city || '',
      cityCoords?.lat ?? 0,
      cityCoords?.lng ?? 0,
      activity || 'run',
      level || 'rookie',
      weeklyKm || 25,
      goal || 'disfrute',
      preferredTime || 'manana',
      joinCommunity ? 1 : 0,
      notifications ? 1 : 0,
      req.user.userId,
    ]);

    const user = await getOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    res.json({ user: safeUser(user) });
  } catch (err) {
    console.error('POST /onboarding error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/badges — todas las insignias (desbloqueadas y bloqueadas)
router.get('/badges', requireAuth, async (req, res) => {
  try {
    const ALL_BADGES = [
      { id: 'b1',  name: 'Primera Ruta',  icon: 'flag',        desc: 'Completa tu primera actividad' },
      { id: 'b2',  name: 'Racha 7 Dias',  icon: 'fire',        desc: '7 dias seguidos activo' },
      { id: 'b3',  name: '100 KM',         icon: 'milestone',   desc: '100 km acumulados' },
      { id: 'b4',  name: 'Nocturno',       icon: 'moon',        desc: 'Ruta entre 22:00 y 05:00' },
      { id: 'b5',  name: 'Bajo la Lluvia', icon: 'rain',        desc: 'Termina con lluvia activa' },
      { id: 'b6',  name: 'Madrugador',     icon: 'sunrise',     desc: 'Empieza antes de las 06:00' },
      { id: 'b7',  name: '1000 KM',        icon: 'milestone-2', desc: '1.000 km acumulados' },
      { id: 'b8',  name: 'Subida Bestia',  icon: 'mountain',    desc: '+1000 m de desnivel positivo' },
      { id: 'b9',  name: 'Velocista',      icon: 'lightning',   desc: 'Ritmo bajo 4:00 /km en 5K' },
      { id: 'b10', name: 'Racha 30 Dias',  icon: 'fire-2',      desc: '30 dias seguidos activo' },
      { id: 'b11', name: 'Ultra',           icon: 'ultra',       desc: 'Mas de 42 km en una salida' },
      { id: 'b12', name: 'Everesting',      icon: 'everest',     desc: '+8.848 m acumulados' },
    ];

    const unlocked = await getAll('SELECT id, unlocked_at FROM badges WHERE user_id = ?', [req.user.userId]);
    const unlockedMap = Object.fromEntries(unlocked.map(b => [b.id, b.unlocked_at]));

    const badges = ALL_BADGES.map(b => ({
      ...b,
      unlocked: !!unlockedMap[b.id],
      date: unlockedMap[b.id] ? new Date(unlockedMap[b.id]).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric',
      }) : null,
    }));

    res.json({ badges });
  } catch (err) {
    console.error('GET /badges error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
