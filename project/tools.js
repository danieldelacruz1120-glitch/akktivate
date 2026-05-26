// tools.js — Free public APIs callable directly from the browser (no key, CORS-friendly)
window.AKK_TOOLS = (() => {
  // ── Browser geolocation ──────────────────────────────────────
  function getPosition(opts = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation no soportado'));
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        e => reject(e),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000, ...opts }
      );
    });
  }

  // ── Forward geocoding via Nominatim ──────────────────────────
  async function forwardGeocode(query) {
    const q = encodeURIComponent(query.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=jsonv2&limit=5&addressdetails=1&accept-language=es`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('Nominatim error');
    const arr = await r.json();
    return arr.map(it => {
      const a = it.address || {};
      const city = a.city || a.town || a.village || a.municipality || a.county || '';
      const district = a.suburb || a.neighbourhood || a.city_district || '';
      return {
        lat: parseFloat(it.lat), lng: parseFloat(it.lon),
        label: district && city ? `${city} · ${district}` : (city || it.display_name.split(',').slice(0,2).join(',')),
        full: it.display_name, city, district,
      };
    });
  }

  // ── Reverse geocoding via OSM Nominatim ──────────────────────
  async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&accept-language=es`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) throw new Error('Nominatim error');
    const j = await r.json();
    const a = j.address || {};
    const city = a.city || a.town || a.village || a.municipality || a.county || '';
    const district = a.suburb || a.neighbourhood || a.city_district || '';
    return {
      city, district,
      label: district && city ? `${city} · ${district}` : (city || j.display_name?.split(',').slice(0,2).join(',')),
      country: a.country || '',
      raw: j,
    };
  }

  // ── Open-Meteo: weather (free, no key, CORS) ─────────────────
  async function getWeather(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
      `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max` +
      `&timezone=auto&forecast_days=3`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Open-Meteo error');
    return r.json();
  }

  // ── Open-Elevation: terrain elevation (free, no key) ─────────
  async function getElevation(points /* [{lat,lng}] */) {
    const locations = points.map(p => `${p.lat},${p.lng}`).join('|');
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${locations}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error('Open-Elevation error');
    const j = await r.json();
    return j.results || [];
  }

  // ── Weather code → human label (es) ──────────────────────────
  const WMO = {
    0: 'Despejado', 1: 'Poco nublado', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Niebla', 48: 'Niebla con escarcha',
    51: 'Llovizna débil', 53: 'Llovizna', 55: 'Llovizna intensa',
    61: 'Lluvia débil', 63: 'Lluvia', 65: 'Lluvia fuerte',
    71: 'Nieve débil', 73: 'Nieve', 75: 'Nieve fuerte',
    77: 'Granos de nieve',
    80: 'Chubascos', 81: 'Chubascos fuertes', 82: 'Chubascos violentos',
    85: 'Chubascos de nieve', 86: 'Chubascos de nieve fuertes',
    95: 'Tormenta', 96: 'Tormenta con granizo débil', 99: 'Tormenta con granizo',
  };

  function describeWMO(code) { return WMO[code] || 'Condiciones variables'; }

  function weatherIcon(code, isDay = 1) {
    if ([0].includes(code)) return isDay ? '☀' : '🌙';
    if ([1, 2].includes(code)) return isDay ? '⛅' : '☁';
    if ([3].includes(code)) return '☁';
    if ([45, 48].includes(code)) return '🌫';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄';
    if ([95, 96, 99].includes(code)) return '⛈';
    return '🌤';
  }

  // Running condition advisor (composite)
  function runningCondition(w) {
    if (!w?.current) return { score: 0, label: 'Sin datos' };
    const t = w.current.temperature_2m;
    const wind = w.current.wind_speed_10m;
    const prec = w.current.precipitation;
    const code = w.current.weather_code;
    let score = 100;
    if (t < 0 || t > 32) score -= 40;
    else if (t < 5 || t > 28) score -= 20;
    else if (t < 8 || t > 24) score -= 8;
    if (wind > 35) score -= 30;
    else if (wind > 22) score -= 15;
    if (prec > 2) score -= 30;
    else if (prec > 0.2) score -= 10;
    if ([61,63,65,80,81,82,95,96,99].includes(code)) score -= 20;
    if ([71,73,75,77,85,86].includes(code)) score -= 15;
    score = Math.max(0, Math.min(100, score));
    const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Buena' : score >= 40 ? 'Aceptable' : score >= 20 ? 'Mala' : 'Pésima';
    const color = score >= 80 ? '#C6FF3D' : score >= 60 ? '#A8E635' : score >= 40 ? '#FFB31A' : '#FF6E3D';
    return { score, label, color };
  }

  // Cache weather/location per session
  const cache = {};
  async function getLocationAndWeather() {
    if (cache.ready) return cache;
    try {
      const pos = await getPosition();
      cache.pos = pos;
      try { cache.geo = await reverseGeocode(pos.lat, pos.lng); } catch (e) { cache.geo = null; }
      try { cache.weather = await getWeather(pos.lat, pos.lng); } catch (e) { cache.weather = null; }
      cache.ready = true;
      cache.real = true;
    } catch (e) {
      // Fallback Madrid Retiro
      cache.pos = { lat: 40.4153, lng: -3.6843 };
      cache.geo = { city: 'Madrid', district: 'Retiro', label: 'Madrid · Retiro' };
      try { cache.weather = await getWeather(cache.pos.lat, cache.pos.lng); } catch (e) { cache.weather = null; }
      cache.ready = true;
      cache.real = false;
      cache.error = e.message || 'Sin permiso de GPS';
    }
    return cache;
  }

  function clearCache() { for (const k of Object.keys(cache)) delete cache[k]; }

  return { getPosition, reverseGeocode, forwardGeocode, getWeather, getElevation, describeWMO, weatherIcon, runningCondition, getLocationAndWeather, clearCache };
})();
