const express = require('express');
const {
  db, calcXP, formatPace, formatDuration,
  applyXP, updateStreak, ensureWeeklyReset,
  checkAndAwardBadges, checkActivityBadges,
} = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

function activityToApi(a, myUserId) {
  const date = new Date(a.created_at);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  let dateLabel;
  if (diffDays === 0) dateLabel = `Hoy · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  else if (diffDays === 1) dateLabel = `Ayer · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  else {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dateLabel = `${days[date.getDay()]} · ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  }
  return {
    id: String(a.id),
    userId: a.user_id,
    type: a.type,
    title: a.title,
    km: a.km,
    time: formatDuration(a.duration_secs),
    pace: a.pace || formatPace(a.km, a.duration_secs, a.type),
    date: dateLabel,
    elev: a.elevation,
    kcal: a.kcal,
    xpEarned: a.xp_earned,
    kudos: a.kudos_count,
    isPublic: !!a.is_public,
    createdAt: a.created_at,
  };
}

// POST /api/activities — registrar una actividad completada
router.post('/', requireAuth, (req, res) => {
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

  ensureWeeklyReset(userId);

  const result = db.prepare(`
    INSERT INTO activities (user_id, type, title, km, duration_secs, pace, elevation, kcal, xp_earned, difficulty, is_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, type, title, km, duration_secs, pace, elevation, kcal, xpEarned, difficulty, is_public ? 1 : 0);

  // Update user totals + weekly stats
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
  `).run(km, hours, elevation, km, kcal, userId);

  const streak = updateStreak(userId);
  const xpResult = applyXP(userId, xpEarned);
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
  const newBadges = [
    ...checkAndAwardBadges(userId),
    ...checkActivityBadges(userId, activity),
  ];

  res.status(201).json({
    activity: activityToApi(activity, userId),
    xpEarned,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
    streak,
    newBadges,
  });
});

// GET /api/activities — historial del usuario autenticado
router.get('/', requireAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;

  const rows = db.prepare(`
    SELECT * FROM activities
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.userId, limit, offset);

  res.json({ activities: rows.map(a => activityToApi(a, req.user.userId)) });
});

// GET /api/activities/:id — una actividad específica
router.get('/:id', requireAuth, (req, res) => {
  const a = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Actividad no encontrada' });
  if (a.user_id !== req.user.userId && !a.is_public) {
    return res.status(403).json({ error: 'No tienes acceso a esta actividad' });
  }
  res.json({ activity: activityToApi(a, req.user.userId) });
});

module.exports = router;
