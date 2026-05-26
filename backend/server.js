require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*', // En producción, cambia esto al dominio de tu app
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

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Akktivate Backend',
    version: '1.0.0',
    time: new Date().toISOString(),
    ai: !!process.env.GEMINI_API_KEY ? 'Gemini ✅' : 'sin configurar',
  });
});

// ── Error handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🏃 Akktivate Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   IA Akko: ${process.env.GEMINI_API_KEY ? '✅ Gemini configurado' : '⚠️  sin configurar (añade GEMINI_API_KEY en .env — gratis en aistudio.google.com/apikey)'}\n`);
});
