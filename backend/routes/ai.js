const express = require('express');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/ai/chat — Groq (LLaMA 3.3 70B)
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
  let locationLine = 'Ubicacion: no especificada.';

  if (ctx?.location) locationLine = `Ubicacion actual: ${ctx.location}.`;
  if (ctx?.weather?.current) {
    const c = ctx.weather.current;
    weatherLine = `Clima ahora: ${Math.round(c.temperature_2m)}C, viento ${Math.round(c.wind_speed_10m)} km/h, humedad ${Math.round(c.relative_humidity_2m)}%.`;
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 6 ? 'madrugada' : hour < 12 ? 'manana' : hour < 18 ? 'tarde' : 'noche';

  return `Eres "Akko", el asistente IA de Akktivate, app para runners, ciclistas y deportistas de resistencia.

Ayudas con: rutas, entrenamientos, tecnica, nutricion, recuperacion, lesiones, material deportivo.

Tono: motivador, directo, muy breve. Siempre en espanol. Frases cortas. Sin emojis. Unidades metricas.

USUARIO: ${name}
HORA: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} (${timeOfDay})
${locationLine}
${weatherLine}

REGLAS:
- Responde en maximo 3 frases.
- Para rutas concretas, redirige a la pestana Rutas.
- Si te piden algo fuera del deporte, redirige amablemente.`;
}

// POST /api/ai/route — ruta real con geocodificacion + mapa
router.post('/route', requireAuth, async (req, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(503).json({ error: 'IA no configurada' });

  const { location, locationLat, locationLng, activity, distance, difficulty } = req.body;
  if (!location || !distance) return res.status(400).json({ error: 'Faltan location y distance' });

  const actNames = { run: 'running a pie', bike: 'bicicleta de carretera', trail: 'trail running', mtb: 'mountain bike' };
  const diffNames = { facil: 'facil', medio: 'moderado', duro: 'duro', pro: 'profesional' };

  // Paso 1: Groq genera nombres de puntos reales de la zona
  const system = `Eres un experto local en rutas deportivas de ${location}.
RESPONDE UNICAMENTE con JSON valido, sin texto extra, sin markdown, sin bloques de codigo.
Formato exacto:
{"name":"nombre creativo (max 28 chars)","start":"lugar de salida concreto y real (plaza, calle, parque)","waypoints":["lugar real 1","lugar real 2","lugar real 3"],"description":"descripcion breve del recorrido (max 90 chars)","tips":"consejo practico (max 60 chars)"}
Usa nombres REALES de ${location}. Los waypoints deben ser lugares reconocibles de la zona. La ruta debe ser circular o acabar cerca del inicio.`;

  const userMsg = `Crea una ruta de exactamente ${distance} km de ${actNames[activity] || activity} en ${location}, nivel ${diffNames[difficulty] || difficulty}.`;

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
      max_tokens: 300, temperature: 0.85,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    let routeInfo = {};
    try {
      const m = text.match(/\{[\s\S]*\}/);
      routeInfo = JSON.parse(m ? m[0] : text);
    } catch (e) {}

    // Paso 2: Geocodificar con Nominatim (OpenStreetMap)
    const pointNames = [routeInfo.start, ...(routeInfo.waypoints || [])].filter(Boolean).slice(0, 4);
    const geocodedCoords = [];

    for (const pointName of pointNames) {
      try {
        const q = encodeURIComponent(`${pointName}, ${location}`);
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
          { headers: { 'User-Agent': 'Akktivate/1.0 (sports app)' }, signal: AbortSignal.timeout(5000) }
        );
        const geoData = await geoRes.json();
        if (geoData?.[0]?.lat) {
          geocodedCoords.push({
            name: pointName,
            lat: parseFloat(geoData[0].lat),
            lng: parseFloat(geoData[0].lon),
          });
        }
      } catch (e) {}
    }

    // Paso 3: Ruta real con OSRM (routing.openstreetmap.de)
    let polyline = [];
    let realDistance = Number(distance);
    let duration = Math.round(distance * (activity === 'bike' || activity === 'mtb' ? 3.5 : 6));

    if (geocodedCoords.length >= 2) {
      const profile = (activity === 'bike' || activity === 'mtb') ? 'bike' : 'foot';
      // Circular: el ultimo punto es el inicio para cerrar la ruta
      const pts = [...geocodedCoords, geocodedCoords[0]];
      const coordStr = pts.map(c => `${c.lng},${c.lat}`).join(';');

      try {
        const osrmRes = await fetch(
          `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${coordStr}?overview=full&geometries=geojson`,
          { headers: { 'User-Agent': 'Akktivate/1.0' }, signal: AbortSignal.timeout(12000) }
        );
        const osrmData = await osrmRes.json();

        if (osrmData.routes?.[0]) {
          polyline = osrmData.routes[0].geometry.coordinates; // [[lng, lat], ...]
          realDistance = parseFloat((osrmData.routes[0].distance / 1000).toFixed(1));
          duration = Math.round(osrmData.routes[0].duration / 60);
        }
      } catch (e) {
        console.error('OSRM error:', e.message);
      }
    }

    // Fallback circular con las coordenadas del usuario si OSRM falla
    if (polyline.length === 0 && locationLat && locationLng) {
      const r = (Number(distance) / 2) / 111;
      const pts = 48;
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * 2 * Math.PI;
        polyline.push([
          Number(locationLng) + r * Math.cos(angle),
          Number(locationLat) + r * Math.sin(angle) * 0.8,
        ]);
      }
    }

    res.json({
      route: {
        ...routeInfo,
        polyline,
        coords: geocodedCoords,
        realDistance,
        duration,
      }
    });
  } catch (err) {
    console.error('Route AI error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
