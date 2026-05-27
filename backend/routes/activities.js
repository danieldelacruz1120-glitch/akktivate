const express = require('express');
const {
  getOne, getAll, run,
  calcXP, formatPace, formatDuration,
  applyXP, updateStreak, ensureWeeklyReset,
  checkAndAwardBadges, checkActivityBadges,
} = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function activityToApi(a) {
  const date = new Date(a.created_at);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  let dateLabel;
  if (diffDays === 0) {
    dateLabel = `Hoy · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  } else if (diffDays === 1) {
    dateLabel = `Ayer · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  } else {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    dateLabel = `${days[date.getDay()]} · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  }
  return {
    id: String(a.id),
    userId: Number(a.user_id),
    type: a.type,
    title: a.title,
    km: Number(a.km),
    time: formatDuration(Number(a.duration_secs)),
    pace: a.pace || formatPace(Number(a.km), Number(a.duration_secs), a.type),
    date: dateLabel,
    elev: Number(a.elevation),
    kcal: Number(a.kcal),
    xpEarned: Number(a.xp_earned),
    kudos: Number(a.kudos_count),
    isPublic: !!Number(a.is_public),
    createdAt: a.created_at,
  };
}

// POST /api/activities — registrar una actividad completada
router.post('/', requireAuth, async (req, res) => {
  try {
    const { type, title, km, duration_secs, elevation = 0, difficulty = 'medio', is_public = true } = req.body;

    if (!type || !title || !km || !duration_secs) {
      return res.status(400).json({ error: 'type, title, km y duration_secs son obligatorios' });
    }
    if (!['run','bike','trail','mtb'].includes(type)) {
      return res.status(400).json({ error: 'type debe ser run, bike, trail o mtb' });
    }

    const userId = req.user.userId;
    const pace = formatPace(km, duration_secs, type);
    const kcal = Math.round(km * 70 * (type === 'run' ? 1.1 : type === 'trail' ? 1.2 : 0.65));
    const xpEarned = calcXP(km, difficulty);
    const hours = duration_secs / 3600;

    await ensureWeeklyReset(userId);

    const result = await run(`
      INSERT INTO activities (user_id, type, title, km, duration_secs, pace, elevation, kcal, xp_earned, difficulty, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, type, title, km, duration_secs, pace, elevation, kcal, xpEarned, difficulty, is_public ? 1 : 0]);

    await run(`
      UPDATE users SET
        total_km = total_km + ?,
        total_activities = total_activities + 1,
        total_hours = total_hours + ?,
        total_elevation = total_elevation + ?,
        weekly_km = weekly_km + ?,
        weekly_activities = weekly_activities + 1,
        weekly_kcal = weekly_kcal + ?
      WHERE id = ?
    `, [km, hours, elevation, km, kcal, userId]);

    const streak = await updateStreak(userId);
    const xpResult = await applyXP(userId, xpEarned);
    const activity = await getOne('SELECT * FROM activities WHERE id = ?', [result.lastInsertRowid]);
    const newBadges = [
      ...await checkAndAwardBadges(userId),
      ...await checkActivityBadges(userId, activity),
    ];

    res.status(201).json({
      activity: activityToApi(activity),
      xpEarned,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      streak,
      newBadges,
    });
  } catch (err) {
    console.error('POST /activities error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activities — historial del usuario autenticado
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    const rows = await getAll(`
      SELECT * FROM activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.userId, limit, offset]);

    res.json({ activities: rows.map(a => activityToApi(a)) });
  } catch (err) {
    console.error('GET /activities error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activities/:id — una actividad especifica
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const a = await getOne('SELECT * FROM activities WHERE id = ?', [req.params.id]);
    if (!a) return res.status(404).json({ error: 'Actividad no encontrada' });
    if (Number(a.user_id) !== req.user.userId && !Number(a.is_public)) {
      return res.status(403).json({ error: 'No tienes acceso a esta actividad' });
    }
    res.json({ activity: activityToApi(a) });
  } catch (err) {
    console.error('GET /activities/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
