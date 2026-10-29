// Utilidades geográficas para el checkout y el simulador de rastreo.

export const HUB = { lat: 19.4975, lng: -99.154, name: '5 a Logística Hub', address: 'Poniente 140 #820, Industrial Vallejo, CDMX' };
export const DEMO_DESTINATION = { lat: 19.4114, lng: -99.1716, label: 'Av. Ámsterdam 210, Hipódromo Condesa, CDMX' };

const R = 6371e3;
const toRad = (d) => (d * Math.PI) / 180;

/** Distancia en metros entre dos puntos [lat, lng]. */
export function haversine([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Prepara una ruta para interpolar por distancia recorrida. */
export function buildRoute(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + haversine(points[i - 1], points[i]));
  return { points, cum, length: cum[cum.length - 1] };
}

/** Posición y rumbo en la ruta para un progreso 0..1 */
export function pointAt(route, t) {
  const { points, cum, length } = route;
  const d = Math.max(0, Math.min(1, t)) * length;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const f = (d - cum[i - 1]) / seg;
  const [a, b] = [points[i - 1], points[i]];
  return {
    pos: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
    index: i,
    headingEast: b[1] >= a[1],
  };
}

/** Ruta sintética (fallback sin red): zig-zag tipo cuadrícula urbana. */
function syntheticRoute(from, to) {
  const pts = [from];
  const steps = 6;
  for (let s = 1; s < steps; s++) {
    const f = s / steps;
    const lat = from[0] + (to[0] - from[0]) * f;
    const lng = from[1] + (to[1] - from[1]) * f;
    pts.push(s % 2 ? [lat, from[1] + (to[1] - from[1]) * (f - 1 / steps)] : [lat, lng]);
  }
  pts.push(to);
  return pts;
}

/** Ruta por calles usando OSRM (servicio público demo). Cae a ruta sintética si falla. */
export async function fetchRoute(from, to, signal) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('OSRM ' + res.status);
    const data = await res.json();
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (!coords?.length) throw new Error('Sin ruta');
    return { points: coords.map(([lng, lat]) => [lat, lng]), source: 'osrm', duration: data.routes[0].duration };
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    return { points: syntheticRoute(from, to), source: 'synthetic' };
  }
}

/** Geocodificación inversa (Nominatim / OpenStreetMap). */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es&addressdetails=1`);
    if (!res.ok) return null;
    const { address = {}, display_name } = await res.json();
    return {
      calle: address.road ?? '',
      numero: address.house_number ?? '',
      colonia: address.neighbourhood ?? address.suburb ?? address.quarter ?? '',
      cp: address.postcode ?? '',
      ciudad: address.city ?? address.borough ?? address.town ?? address.city_district ?? '',
      estado: address.state ?? '',
      display: display_name,
    };
  } catch {
    return null;
  }
}

/** Búsqueda de dirección -> coordenadas */
export async function geocode(query) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&accept-language=es&q=${encodeURIComponent(query)}`);
    const [hit] = await res.json();
    return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
  } catch {
    return null;
  }
}
