const express = require('express');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/ai/chat — Groq (LLaMA 3.3 70B, gratis y rápido)
router.post('/chat', requireAuth, async (req, res) => {
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: 'Asistente IA no configurado' });
  }

  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages es obligatorio' });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = buildSystemPrompt(req.user, context);
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      })),
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sin respuesta.';
    res.json({ reply });
  } catch (err) {
    console.error('Error Groq API:', err.message);
    res.status(500).json({ error: 'Error al conectar con la IA: ' + err.message });
  }
});

function buildSystemPrompt(user, ctx) {
  const name = user?.name || 'Atleta';
  let weatherLine = 'Clima: sin datos.';
  let locationLine = 'Ubicación: no especificada.';

  if (ctx?.location) locationLine = `Ubicación actual: ${ctx.location}.`;
  if (ctx?.weather?.current) {
    const c = ctx.weather.current;
    weatherLine = `Clima ahora: ${Math.round(c.temperature_2m)}°C, viento ${Math.round(c.wind_speed_10m)} km/h, humedad ${Math.round(c.relative_humidity_2m)}%.`;
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 6 ? 'madrugada' : hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';

  return `Eres "Akko", el asistente IA de Akktivate, app para runners, ciclistas y deportistas de resistencia.

Ayudas con: rutas, entrenamientos, técnica, nutrición, recuperación, lesiones, material deportivo.

Tono: motivador, directo, muy breve. Siempre en español. Frases cortas. Sin emojis. Unidades métricas.

USUARIO: ${name}
HORA: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (${timeOfDay})
${locationLine}
${weatherLine}

REGLAS:
- Responde en máximo 3 frases.
- Para rutas concretas, redirige a la pestaña Rutas.
- Si te piden algo fuera del deporte, redirige amablemente.`;
}

module.exports = router;
