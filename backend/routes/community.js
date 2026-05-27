const express = require('express');
const { getOne, getAll, run, formatDuration, formatPace, relativeDate } = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const AVATAR_COLORS = ['#FF4D1A','#C6FF3D','#5DC9F2','#FFB31A','#FF6E3D','#E6E6FF','#9AA0FF'];

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A';
}

function userColor(userId) {
  return AVATAR_COLORS[Number(userId) % AVATAR_COLORS.length];
}

// GET /api/community/feed — actividades publicas recientes
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const rows = await getAll(`
      SELECT a.*, u.name AS user_name, u.id AS user_id
      FROM activities a
      JOIN users u ON u.id = a.user_id
      WHERE a.is_public = 1
      ORDER BY a.created_at DESC
      LIMIT ?
    `, [limit]);

    const myId = req.user.userId;
    const myKudosRows = await getAll('SELECT activity_id FROM kudos WHERE user_id = ?', [myId]);
    const myKudosIds = new Set(myKudosRows.map(r => Number(r.activity_id)));

    const feed = rows.map(a => ({
      id: String(a.id),
      user: a.user_name,
      initials: initials(a.user_name),
      color: userColor(a.user_id),
      isMe: Number(a.user_id) === myId,
      type: a.type,
      title: a.title,
      km: Number(a.km),
      time: formatDuration(Number(a.duration_secs)),
      pace: a.pace || formatPace(Number(a.km), Number(a.duration_secs), a.type),
      kudos: Number(a.kudos_count),
      when: relativeDate(a.created_at),
      liked: myKudosIds.has(Number(a.id)),
      elev: Number(a.elevation),
    }));

    res.json({ feed });
  } catch (err) {
    console.error('GET /feed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/kudos/:activityId — dar/quitar kudos
router.post('/kudos/:activityId', requireAuth, async (req, res) => {
  try {
    const activityId = parseInt(req.params.activityId);
    const userId = req.user.userId;

    const activity = await getOne('SELECT id, kudos_count FROM activities WHERE id = ?', [activityId]);
    if (!activity) return res.status(404).json({ error: 'Actividad no encontrada' });

    const existing = await getOne('SELECT id FROM kudos WHERE activity_id=? AND user_id=?', [activityId, userId]);

    if (existing) {
      await run('DELETE FROM kudos WHERE activity_id=? AND user_id=?', [activityId, userId]);
      await run('UPDATE activities SET kudos_count = kudos_count - 1 WHERE id=?', [activityId]);
      const updated = await getOne('SELECT kudos_count FROM activities WHERE id=?', [activityId]);
      return res.json({ kudos: Number(updated.kudos_count), liked: false });
    } else {
      await run('INSERT INTO kudos (activity_id, user_id) VALUES (?,?)', [activityId, userId]);
      await run('UPDATE activities SET kudos_count = kudos_count + 1 WHERE id=?', [activityId]);
      const updated = await getOne('SELECT kudos_count FROM activities WHERE id=?', [activityId]);
      return res.json({ kudos: Number(updated.kudos_count), liked: true });
    }
  } catch (err) {
    console.error('POST /kudos error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/community/ranking — ranking semanal
router.get('/ranking', requireAuth, async (req, res) => {
  try {
    const rows = await getAll(`
      SELECT u.id, u.name, u.weekly_km, u.location
      FROM users u
      WHERE u.join_community = 1
      ORDER BY u.weekly_km DESC
      LIMIT 10
    `, []);

    const myId = req.user.userId;
    let position = rows.findIndex(r => Number(r.id) === myId);

    if (position === -1) {
      const me = await getOne('SELECT id, name, weekly_km, location FROM users WHERE id = ?', [myId]);
      if (me) rows.push(me);
      position = rows.length - 1;
    }

    const ranking = rows.map((r, i) => ({
      rank: i + 1,
      user: r.name,
      initials: initials(r.name),
      color: userColor(r.id),
      km: parseFloat(Number(r.weekly_km).toFixed(1)),
      change: 0,
      isMe: Number(r.id) === myId,
    }));

    res.json({ ranking });
  } catch (err) {
    console.error('GET /ranking error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
