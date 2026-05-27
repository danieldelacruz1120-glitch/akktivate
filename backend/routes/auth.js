const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, xpToNextLevel } = require('../db');

const router = express.Router();

function makeToken(userId) {
  const secret = process.env.JWT_SECRET || 'akktivate_secreto_xK9mP2qL8nR4wZ7vT1jY5bH6cF3sD0eA';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
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

    // Enviar email de bienvenida (no bloquea el registro si falla)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Akktivate <onboarding@resend.dev>',
          to: email.trim().toLowerCase(),
          subject: '¡Bienvenido a Akktivate!',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0A0507;color:#fff;padding:32px;border-radius:12px;">
              <h1 style="color:#FF4D1A;font-size:28px;margin-bottom:8px;">¡Bienvenido, ${name}!</h1>
              <p style="color:#aaa;font-size:16px;">Tu cuenta en <strong style="color:#fff">Akktivate</strong> ha sido creada correctamente.</p>
              <p style="color:#aaa;font-size:14px;margin-top:24px;">Ya puedes empezar a registrar tus rutas, ganar XP y competir en el ranking.</p>
              <a href="https://danieldelacruz1120-glitch.github.io/akktivate"
                 style="display:inline-block;margin-top:24px;padding:14px 28px;background:#FF4D1A;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
                Abrir Akktivate
              </a>
              <p style="color:#555;font-size:12px;margin-top:32px;">Si no has creado esta cuenta, ignora este mensaje.</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Email error (no crítico):', emailErr.message);
      }
    }

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
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    res.json({ token: makeToken(user.id), user: safeUser(user) });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

module.exports = router;
module.exports.safeUser = safeUser;
module.exports.makeToken = makeToken;
