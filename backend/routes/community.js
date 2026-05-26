const express = require('express');
const { db, formatDuration, formatPace, relativeDate } = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const AVATAR_COLORS = ['#FF4D1A','#C6FF3D','#5DC9F2','#FFB31A','#FF6E3D','#E6E6FF','#9AA0FF'];

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A';
}

function userColor(userId) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

// GET /api/community/feed — actividades públicas recientes
router.get('/feed', requireAuth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const rows = db.prepare(`
    SELECT a.*, u.name AS user_name, u.id AS user_id
    FROM activities a
    JOIN users u ON u.id = a.user_id
    WHERE a.is_public = 1
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(limit);

  const myId = req.user.userId;

  // Check kudos by this user
  const myKudosIds = db.prepare(
    'SELECT activity_id FROM kudos WHERE user_id = ?'
  ).all(myId).map(r => r.activity_id);

  const feed = rows.map(a => ({
    id: String(a.id),
    user: a.user_name,
    initials: initials(a.user_name),
    color: userColor(a.user_id),
    isMe: a.user_id === myId,
    type: a.type,
    title: a.title,
    km: a.km,
    time: formatDuration(a.duration_secs),
    pace: a.pace || formatPace(a.km, a.duration_secs, a.type),
    kudos: a.kudos_count,
    when: relativeDate(a.created_at),
    liked: myKudosIds.includes(a.id),
    elev: a.elevation,
  }));

  res.json({ feed });
});

// POST /api/community/kudos/:activityId — dar/quitar kudos
router.post('/kudos/:activityId', requireAuth, (req, res) => {
  const activityId = parseInt(req.params.activityId);
  const userId = req.user.userId;

  const activity = db.prepare('SELECT id, kudos_count FROM activities WHERE id = ?').get(activityId);
  if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });

  const existing = db.prepare('SELECT id FROM kudos WHERE activity_id=? AND user_id=?').get(activityId, userId);

  if (existing) {
    db.prepare('DELETE FROM kudos WHERE activity_id=? AND user_id=?').run(activityId, userId);
    db.prepare('UPDATE activities SET kudos_count = kudos_count - 1 WHERE id=?').run(activityId);
    const updated = db.prepare('SELECT kudos_count FROM activities WHERE id=?').get(activityId);
    return res.json({ kudos: updated.kudos_count, liked: false });
  } else {
    db.prepare('INSERT INTO kudos (activity_id, user_id) VALUES (?,?)').run(activityId, userId);
    db.prepare('UPDATE activities SET kudos_count = kudos_count + 1 WHERE id=?').run(activityId);
    const updated = db.prepare('SELECT kudos_count FROM activities WHERE id=?').get(activityId);
    return res.json({ kudos: updated.kudos_count, liked: true });
  }
});

// GET /api/community/ranking — ranking semanal por zona
router.get('/ranking', requireAuth, (req, res) => {
  // Agrupamos km de esta semana ISO
  const rows = db.prepare(`
    SELECT u.id, u.name, u.weekly_km, u.location
    FROM users u
    WHERE u.join_community = 1
    ORDER BY u.weekly_km DESC
    LIMIT 10
  `).all();

  const myId = req.user.userId;
  let position = rows.findIndex(r => r.id === myId);

  // Si el usuario no aparece en top 10, añadirlo al final
  if (position === -1) {
    const me = db.prepare('SELECT id, name, weekly_km, location FROM users WHERE id = ?').get(myId);
    if (me) rows.push(me);
    position = rows.length - 1;
  }

  const ranking = rows.map((r, i) => ({
    rank: i + 1,
    user: r.name,
    initials: initials(r.name),
    color: userColor(r.id),
    km: parseFloat(r.weekly_km.toFixed(1)),
    change: 0, // simplificado — en producción se compararía con semana anterior
    isMe: r.id === myId,
  }));

  res.json({ ranking });
});

module.exports = router;
