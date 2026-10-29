import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair, LoaderCircle, Search } from 'lucide-react';
import { homeIcon, hubIcon, TILE_ATTRIBUTION, TILE_URL } from '../lib/mapIcons';
import { geocode, haversine, HUB } from '../lib/geo';

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
function FlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [coords, map]);
  return null;
}

/** Selector interactivo de ubicación de entrega (clic, arrastre, búsqueda o GPS). */
export default function MapPicker({ value, onChange }) {
  const markerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current;
        if (m) {
          const { lat, lng } = m.getLatLng();
          onChange(lat, lng);
        }
      },
    }),
    [onChange]
  );

  const search = async () => {
    if (!query.trim()) return;
    setBusy(true);
    setError('');
    const hit = await geocode(query);
    setBusy(false);
    hit ? onChange(hit.lat, hit.lng) : setError('No encontramos esa dirección. Intenta con calle y colonia.');
  };

  const locate = () => {
    if (!navigator.geolocation) return setError('Tu navegador no soporta geolocalización.');
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBusy(false);
        onChange(p.coords.latitude, p.coords.longitude);
      },
      () => {
        setBusy(false);
        setError('No pudimos obtener tu ubicación. Selecciónala en el mapa.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const km = value ? (haversine([HUB.lat, HUB.lng], [value.lat, value.lng]) / 1000).toFixed(1) : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-60 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-navy-500 focus-within:ring-4 focus-within:ring-navy-100">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
            placeholder="Buscar dirección en el mapa…"
            aria-label="Buscar dirección en el mapa"
            className="flex-1 px-3.5 py-2.5 text-sm outline-none"
          />
          <button type="button" onClick={search} className="px-3 text-navy-700 hover:text-gold-700" aria-label="Buscar en mapa">
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          </button>
        </div>
        <button type="button" onClick={locate} className="btn-ghost">
          <Crosshair className="size-4" /> Usar mi ubicación
        </button>
      </div>
      {error && <p className="text-sm text-coral-500" role="alert">{error}</p>}

      <div className="relative h-80 overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <MapContainer center={value ? [value.lat, value.lng] : [19.44, -99.16]} zoom={12} scrollWheelZoom className="size-full">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <Marker position={[HUB.lat, HUB.lng]} icon={hubIcon} />
          <ClickHandler onPick={onChange} />
          {value && <Marker position={[value.lat, value.lng]} icon={homeIcon} draggable eventHandlers={handlers} ref={markerRef} />}
          <FlyTo coords={value} />
        </MapContainer>
        <p className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-navy-900 shadow">
          {value ? `📍 ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)} · ${km} km del Hub` : 'Haz clic en el mapa para marcar tu domicilio'}
        </p>
      </div>
    </div>
  );
}
