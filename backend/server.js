require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

// Evitar que el proceso muera por errores no capturados
process.on('uncaughtException', err => console.error('uncaughtException:', err.message));
process.on('unhandledRejection', err => console.error('unhandledRejection:', err?.message));

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/user',       require('./routes/user'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/community',  require('./routes/community'));
app.use('/api/ai',         require('./routes/ai'));
app.use('/api/admin',      require('./routes/admin'));

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Akktivate Backend',
    version: '2.0.0',
    time: new Date().toISOString(),
    db: process.env.TURSO_DATABASE_URL ? 'Turso' : 'SQLite local',
    ai: process.env.GROQ_API_KEY ? 'Groq OK' : 'sin configurar',
  });
});

// ── Error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arranque con Turso ────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    console.log('Base de datos Turso conectada y lista.');
    app.listen(PORT, () => {
      console.log(`\nAkktivate Backend en http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   DB: ${process.env.TURSO_DATABASE_URL ? 'Turso (persistente)' : 'SQLite local'}`);
      console.log(`   IA Akko: ${process.env.GROQ_API_KEY ? 'Groq configurado' : 'GROQ_API_KEY no configurada'}\n`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err.message);
    process.exit(1);
  });
