const express = require('express');
const { getOne, getAll, run } = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── Admin middleware ───────────────────────────────────────────────
async function requireAdmin(req, res, next) {
  try {
    const user = await getOne('SELECT email FROM users WHERE id = ?', [req.user.userId]);
    const adminEmail = process.env.ADMIN_EMAIL || 'danieldelacruz1120@gmail.com';
    if (!user || user.email !== adminEmail) {
      return res.status(403).json({ error: 'Acceso denegado — no eres administrador' });
    }
    req.adminEmail = adminEmail;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/admin/stats
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const totalUsersRow      = await getOne('SELECT COUNT(*) as n FROM users', []);
    const totalActivitiesRow = await getOne('SELECT COUNT(*) as n FROM activities', []);
    const totalKmRow         = await getOne('SELECT ROUND(SUM(total_km),1) as n FROM users', []);
    const newThisWeekRow     = await getOne("SELECT COUNT(*) as n FROM users WHERE created_at >= datetime('now','-7 days')", []);
    const activeTodayRow     = await getOne("SELECT COUNT(*) as n FROM users WHERE last_login >= datetime('now','start of day')", []);
    const activeLast7Row     = await getOne("SELECT COUNT(*) as n FROM users WHERE last_login >= datetime('now','-7 days')", []);

    res.json({
      totalUsers:      Number(totalUsersRow?.n || 0),
      totalActivities: Number(totalActivitiesRow?.n || 0),
      totalKm:         Number(totalKmRow?.n || 0),
      newThisWeek:     Number(newThisWeekRow?.n || 0),
      activeToday:     Number(activeTodayRow?.n || 0),
      activeLast7Days: Number(activeLast7Row?.n || 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await getAll(`
      SELECT id, name, email, provider, level, xp, streak,
             total_km, total_activities, location, created_at, last_login
      FROM users ORDER BY created_at DESC
    `, []);
    // Normalize numeric fields
    res.json(users.map(u => ({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      provider: u.provider,
      level: Number(u.level),
      xp: Number(u.xp),
      streak: Number(u.streak),
      total_km: Number(u.total_km),
      total_activities: Number(u.total_activities),
      location: u.location,
      created_at: u.created_at,
      last_login: u.last_login,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const adminUser = await getOne('SELECT id FROM users WHERE email = ?', [req.adminEmail]);
    const targetId = parseInt(req.params.id, 10);
    if (adminUser && targetId === Number(adminUser.id)) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    await run('DELETE FROM users WHERE id = ?', [targetId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
