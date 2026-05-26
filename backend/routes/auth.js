const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, xpToNextLevel } = require('../db');

const router = express.Router();

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

function safeUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    provider: u.provider,
    level: u.level,
    xp: u.xp,
    xpToNext: u.xp_to_next,
    streak: u.streak,
    location: u.location,
    locationLat: u.location_lat,
    locationLng: u.location_lng,
    totals: {
      km: u.total_km,
      activities: u.total_activities,
      hours: u.total_hours,
      elevation: u.total_elevation,
    },
    weekly: {
      km: u.weekly_km,
      activities: u.weekly_activities,
      kcal: u.weekly_kcal,
      goal: u.weekly_km_goal,
    },
    onboarded: !!(u.activity_type && u.level_exp !== 'rookie' || u.location !== 'Madrid · Retiro'),
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, provider, xp_to_next)
      VALUES (?, ?, ?, 'email', ?)
    `).run(name.trim(), email.trim().toLowerCase(), hash, xpToNextLevel(1));
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ token: makeToken(user.id), user: safeUser(user) });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
    if (!user)
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    if (user.provider !== 'email' && !user.password_hash)
      return res.status(401).json({ error: `Esta cuenta usa ${user.provider} para iniciar sesión` });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    res.json({ token: makeToken(user.id), user: safeUser(user) });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

module.exports = router;
module.exports.safeUser = safeUser;
module.exports.makeToken = makeToken;
