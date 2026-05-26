// realroute.jsx — Generates real walkable/bikeable routes via OSRM (free, no key)
// and renders them with Leaflet (OpenStreetMap tiles).

window.AKK_ROUTING = (() => {
  // Build a circular loop by routing through N points around a center
  async function generateLoop({ lat, lng }, targetKm = 5, activity = 'run') {
    const profile = (activity === 'bike' || activity === 'mtb') ? 'bike' : 'foot';
    // Heuristic: radius for waypoints so that a triangle loop ~= targetKm
    const radiusKm = Math.max(0.4, targetKm * 0.16);
    const kmToLat = 1 / 111;
    const kmToLng = 1 / (111 * Math.cos(lat * Math.PI / 180));
    // Random starting bearing for variety
    const seed = Math.floor(lat * 1000) + Math.floor(lng * 1000) + Math.floor(targetKm * 7);
    const startAngle = (seed % 360) * Math.PI / 180;
    const N = 3;
    const points = [{ lat, lng }];
    for (let i = 0; i < N; i++) {
      const a = startAngle + (i * 2 * Math.PI / N);
      const px = lat + Math.sin(a) * radiusKm * kmToLat;
      const py = lng + Math.cos(a) * radiusKm * kmToLng;
      points.push({ lat: px, lng: py });
    }

    const coordsStr = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `https://router.project-osrm.org/trip/v1/${profile}/${coordsStr}?roundtrip=true&source=first&overview=full&geometries=geojson&steps=false`;

    const r = await fetch(url);
    if (!r.ok) throw new Error('OSRM trip ' + r.status);
    const j = await r.json();
    if (!j.trips || !j.trips[0]) throw new Error('OSRM no trip');
    const trip = j.trips[0];
    const geojson = trip.geometry;
    const coordsLngLat = geojson.coordinates;
    // Convert to [lat,lng] for Leaflet
    const latlngs = coordsLngLat.map(([lng, lat]) => [lat, lng]);

    return {
      latlngs,
      distanceKm: +(trip.distance / 1000).toFixed(2),
      durationMin: Math.round(trip.duration / 60),
      waypoints: j.waypoints,
    };
  }

  // Render a Leaflet map with a route polyline
  function renderMap(container, { latlngs, color = '#FF4D1A', center, zoom = 14, fitBounds = true }) {
    if (!window.L) throw new Error('Leaflet not loaded');
    const L = window.L;
    container.innerHTML = '';
    container.style.height = container.style.height || '100%';
    container.style.width = container.style.width || '100%';

    const c = center || latlngs?.[0] || [40.4153, -3.6843];
    const map = L.map(container, { zoomControl: false, attributionControl: false }).setView(c, zoom);

    // Dark Carto basemap (free, no key)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Attribution as small pill (corner)
    L.control.attribution({ prefix: false, position: 'bottomright' })
      .addAttribution('© OpenStreetMap · OSRM')
      .addTo(map);

    if (latlngs && latlngs.length > 1) {
      // shadow line
      L.polyline(latlngs, { color: '#000', weight: 8, opacity: 0.45 }).addTo(map);
      // main line
      L.polyline(latlngs, { color, weight: 4.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map);

      // Start marker
      const start = latlngs[0];
      L.circleMarker(start, { radius: 8, color: '#0A0507', weight: 2, fillColor: '#C6FF3D', fillOpacity: 1 })
        .bindTooltip('Inicio', { permanent: false, direction: 'top' })
        .addTo(map);
      // End marker (same as start for loop)
      const end = latlngs[latlngs.length - 1];
      L.circleMarker(end, { radius: 7, color: '#0A0507', weight: 2, fillColor: color, fillOpacity: 1 }).addTo(map);

      if (fitBounds) {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    } else {
      L.circleMarker(c, { radius: 8, color: '#0A0507', weight: 2, fillColor: color, fillOpacity: 1 }).addTo(map);
    }

    return map;
  }

  return { generateLoop, renderMap };
})();
