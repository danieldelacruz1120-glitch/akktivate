const express = require('express');
const { db } = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// ── Admin middleware ───────────────────────────────────────────────
function requireAdmin(req, res, next) {
  try {
    const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.user.userId);
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
router.get('/stats', requireAuth, requireAdmin, (req, res) => {
  try {
    const totalUsers       = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
    const totalActivities  = db.prepare('SELECT COUNT(*) as n FROM activities').get().n;
    const totalKm          = db.prepare('SELECT ROUND(SUM(total_km),1) as n FROM users').get().n || 0;
    const newThisWeek      = db.prepare("SELECT COUNT(*) as n FROM users WHERE created_at >= datetime('now','-7 days')").get().n;
    const activeToday      = db.prepare("SELECT COUNT(*) as n FROM users WHERE last_login >= datetime('now','start of day')").get().n;
    const activeLast7Days  = db.prepare("SELECT COUNT(*) as n FROM users WHERE last_login >= datetime('now','-7 days')").get().n;

    res.json({ totalUsers, totalActivities, totalKm, newThisWeek, activeToday, activeLast7Days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, provider, level, xp, streak,
             total_km, total_activities, location, created_at, last_login
      FROM users ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(req.adminEmail);
    const targetId = parseInt(req.params.id, 10);
    if (targetId === adminUser?.id) {
      return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
