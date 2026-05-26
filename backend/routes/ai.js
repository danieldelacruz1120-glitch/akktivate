const express = require('express');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/ai/chat — proxy a Gemini (gratis) para el asistente Akko
router.post('/chat', requireAuth, async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'Asistente IA no configurado',
      hint: 'Añade GEMINI_API_KEY en el archivo .env — consíguela gratis en https://aistudio.google.com/apikey',
    });
  }

  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages es obligatorio' });
  }

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    systemInstruction: buildSystemPrompt(req.user, context),
  });

  // Convertir historial al formato de Gemini
  // Gemini espera roles 'user' y 'model' (no 'assistant')
  // Y el último mensaje debe ser del user
  const history = messages.slice(-10);
  const lastMsg = history[history.length - 1];
  const chat = model.startChat({
    history: history.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content) }],
    })),
  });

  try {
    const result = await chat.sendMessage(String(lastMsg?.content || ''));
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Error Gemini API:', err.message);
    if (err.message?.includes('API_KEY') || err.status === 400) {
      return res.status(401).json({ error: 'API key de Gemini inválida. Revisa tu archivo .env' });
    }
    res.status(500).json({ error: 'Error al conectar con la IA. Inténtalo de nuevo.' });
  }
});

function buildSystemPrompt(user, ctx) {
  const name = user?.name || 'Atleta';
  let weatherLine = 'Clima: sin datos.';
  let locationLine = 'Ubicación: no especificada.';

  if (ctx?.location) locationLine = `Ubicación: ${ctx.location}.`;
  if (ctx?.weather?.current) {
    const c = ctx.weather.current;
    weatherLine = `Clima: ${Math.round(c.temperature_2m)}°C, viento ${Math.round(c.wind_speed_10m)} km/h, humedad ${Math.round(c.relative_humidity_2m)}%.`;
  }
  const hour = new Date().getHours();
  const timeOfDay = hour < 6 ? 'madrugada' : hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';

  return `Eres "Akko", el asistente IA de Akktivate, una app para runners, ciclistas y deportistas de resistencia.

Ayudas con: rutas, planificación de entrenamientos, técnica, nutrición, recuperación, prevención de lesiones, material deportivo.

Tono: motivador, directo, breve. Habla siempre en español. Frases cortas. Sin emojis. Unidades métricas.

CONTEXTO DEL USUARIO:
Nombre: ${name}
Hora local: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (${timeOfDay})
${locationLine}
${weatherLine}

LIMITACIONES:
- No tienes acceso a mapas turn-by-turn. Para rutas concretas, redirige al generador de la pestaña Rutas.
- No tienes historial de entrenamientos del usuario.
- Si te piden algo fuera del deporte, redirige amablemente.`;
}

module.exports = router;
