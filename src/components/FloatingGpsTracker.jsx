import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import {
  ArrowRight,
  Box,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  MapPin,
  Maximize2,
  Package,
  RotateCcw,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  computeSimTime,
  DEPART,
  getTrackingState,
  initOrderTracking,
  playDeliveryChime,
  PREP_START,
  saveTrackingState,
  TOTAL_TRACKING_TIME,
  TRAVEL,
} from '../lib/trackingManager';
import { buildRoute, DEMO_DESTINATION, fetchRoute, HUB, pointAt } from '../lib/geo';
import { homeIcon, hubIcon, TILE_ATTRIBUTION, TILE_URL, truckIcon } from '../lib/mapIcons';

const STAGES = [
  { label: 'Pedido recibido', short: 'Pedido', desc: 'Confirmando orden', icon: Package },
  { label: 'En preparación y empaque', short: 'Preparación', desc: 'Picking y empaque en el Hub', icon: Box },
  { label: 'En tránsito', short: 'Tránsito', desc: 'Camioneta en camino', icon: Truck },
  { label: 'En ruta final de entrega', short: 'Ruta final', desc: 'A pocas calles de tu casa', icon: MapPin },
  { label: 'Entregado', short: 'Entregado', desc: '¡Paquete en tu domicilio!', icon: CircleCheck },
];

function MiniMapHandler({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route || !route.points?.length) return;

    const fitRoute = () => {
      map.invalidateSize();
      map.fitBounds(route.points, { padding: [22, 22], maxZoom: 14, animate: false });
    };

    fitRoute();
    const t1 = setTimeout(fitRoute, 120);
    const t2 = setTimeout(fitRoute, 450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, route]);

  return null;
}

export default function FloatingGpsTracker() {
  const { orders } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Si el usuario ya está en la vista completa de rastreo, ocultamos el mini mapa flotante
  const isTrackingPage = location.pathname.startsWith('/rastreo');

  // Por defecto siempre cerrado (colapsado) hasta que el usuario le pique
  const [expanded, setExpanded] = useState(false);
  const [route, setRoute] = useState(null);

  // Orden activa: toma la más reciente del usuario o la orden de demostración 5A
  const activeOrder = useMemo(() => {
    if (orders && orders.length > 0) return orders[0];
    return {
      number: '#5A-LOG-78214',
      shipping: {
        nombre: 'Cliente 5A',
        calle: 'Av. Ámsterdam',
        numero: '210',
        colonia: 'Hipódromo Condesa',
        coords: DEMO_DESTINATION,
      },
      lines: [{ name: 'Base Luminous Silk Foundation', brand: 'Maison Lumière', qty: 1 }],
      totals: { total: 1290 },
    };
  }, [orders]);

  const orderNumber = activeOrder.number;
  const destination = activeOrder.shipping?.coords || DEMO_DESTINATION;

  // Cargar ruta geográfica
  useEffect(() => {
    if (!destination) return;
    const ctrl = new AbortController();
    fetchRoute([HUB.lat, HUB.lng], [destination.lat, destination.lng], ctrl.signal)
      .then((r) => {
        setRoute(buildRoute(r.points));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [destination.lat, destination.lng]);

  // Asegurar inicialización en trackingManager
  useEffect(() => {
    if (orderNumber) {
      initOrderTracking(orderNumber);
    }
  }, [orderNumber]);

  // Estado del tiempo de simulación local y velocidad
  const [simTime, setSimTime] = useState(() => {
    const track = getTrackingState(orderNumber);
    return track ? computeSimTime(track) : 0;
  });

  const [speed, setSpeed] = useState(() => {
    const track = getTrackingState(orderNumber);
    return track?.speed || 1;
  });

  const changeSpeed = (s) => {
    setSpeed(s);
    const track = getTrackingState(orderNumber);
    const current = track ? computeSimTime(track) : simTime;
    saveTrackingState(orderNumber, {
      speed: s,
      accumulatedTime: current,
      lastTick: Date.now(),
    });
  };

  const restart = () => {
    saveTrackingState(orderNumber, {
      accumulatedTime: 0,
      lastTick: Date.now(),
      startTime: Date.now(),
      speed,
      paused: false,
      delivered: false,
      notified: false,
      notifiedStage: 0,
    });
    setSimTime(0);
    lastStageRef.current = -1;
  };

  const lastStageRef = useRef(-1);

  // Actualización periódica fluida de la posición y la etapa (150 ms para ultra fluidez incluso a 12x)
  useEffect(() => {
    if (isTrackingPage) return;

    const interval = setInterval(() => {
      let track = getTrackingState(orderNumber);
      if (!track) {
        initOrderTracking(orderNumber);
        track = getTrackingState(orderNumber);
      }
      if (!track) return;

      if (track.speed && track.speed !== speed) {
        setSpeed(track.speed);
      }

      const current = computeSimTime(track);
      setSimTime(current);

      const progress = Math.max(0, Math.min(1, (current - DEPART) / TRAVEL));
      let currentStage = 0;
      if (track.delivered || current >= TOTAL_TRACKING_TIME) {
        currentStage = 4;
      } else if (progress >= 0.75) {
        currentStage = 3;
      } else if (current >= DEPART) {
        currentStage = 2;
      } else if (current >= PREP_START) {
        currentStage = 1;
      }

      // Al cambiar a la fase final de llegada, reproducir el sonido armónico
      if (currentStage === 4 && lastStageRef.current !== 4 && lastStageRef.current !== -1) {
        playDeliveryChime();
        saveTrackingState(orderNumber, {
          accumulatedTime: TOTAL_TRACKING_TIME,
          lastTick: Date.now(),
          delivered: true,
          deliveredAt: track.deliveredAt || new Date().toISOString(),
          notified: true,
          notifiedStage: 4,
        });
      }

      lastStageRef.current = currentStage;
    }, 150);

    return () => clearInterval(interval);
  }, [orderNumber, isTrackingPage, speed]);

  if (isTrackingPage) return null;

  const progress = Math.max(0, Math.min(1, (simTime - DEPART) / TRAVEL));
  const isDelivered = simTime >= TOTAL_TRACKING_TIME;

  const stage = isDelivered
    ? 4
    : progress >= 0.75
    ? 3
    : simTime >= DEPART
    ? 2
    : simTime >= PREP_START
    ? 1
    : 0;

  const currentStepInfo = STAGES[stage];

  // Cálculo de la posición del camión sobre la ruta
  let truckPos = route ? route.points[0] : [HUB.lat, HUB.lng];
  let headingEast = false;
  let traveledPoints = route ? [route.points[0]] : [];

  if (route && route.points.length > 0) {
    if (isDelivered) {
      truckPos = [destination.lat, destination.lng];
      traveledPoints = route.points;
    } else if (progress > 0) {
      const pt = pointAt(route, progress);
      truckPos = pt.pos;
      headingEast = pt.headingEast;
      traveledPoints = [...route.points.slice(0, pt.index), pt.pos];
    }
  }

  const goToTracking = () => {
    navigate(`/rastreo/${encodeURIComponent(orderNumber)}`);
  };

  return (
    <div className="no-print">
      {/* Botón flotante colapsado (Píldora interactiva con telemetría en vivo) */}
      {!expanded ? (
        <div className="fixed bottom-5 right-5 z-40 flex items-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Abrir mini mapa GPS en tiempo real"
            className={`group flex items-center gap-3 rounded-full border px-4 py-2.5 shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-navy-950 ${
              isDelivered
                ? 'border-mint-500 ring-2 ring-mint-500/30'
                : 'border-slate-700 ring-2 ring-gold-500/20'
            }`}
          >
            <span className="relative grid size-9 place-items-center rounded-full bg-navy-900 text-gold-400 border border-gold-500/40 shrink-0">
              {isDelivered ? (
                <CircleCheck className="size-5 text-mint-400" />
              ) : (
                <Truck className="size-5 text-gold-400" />
              )}
              <span className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ${isDelivered ? 'bg-mint-400' : 'bg-emerald-400 animate-ping'}`} />
              <span className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ${isDelivered ? 'bg-mint-400' : 'bg-emerald-400'}`} />
            </span>

            <div className="text-left pr-1 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">GPS En Vivo</span>
                <span className="text-[10px] font-mono text-slate-300">· {orderNumber}</span>
              </div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {currentStepInfo.label}
                {stage === 2 && (
                  <span className="text-[11px] font-mono font-medium text-gold-400">({Math.round(progress * 100)}%)</span>
                )}
              </p>
            </div>

            <ChevronUp className="size-4 text-slate-300 group-hover:text-gold-400 transition-colors shrink-0" />
          </button>
        </div>
      ) : (
        /* Tarjeta flotante expandida con el Mini Mapa Leaflet y etapas dinámicas */
        <aside
          role="dialog"
          aria-label="Mini mapa GPS en tiempo real"
          className={`fixed bottom-5 right-5 z-40 flex flex-col overflow-hidden rounded-3xl border shadow-2xl animate-fade-up transition-all bg-white ${
            isDelivered
              ? 'border-mint-500 ring-2 ring-mint-500/30'
              : 'border-slate-300 shadow-navy-950/20'
          }`}
          style={{ width: 'min(22.5rem, calc(100vw - 2.5rem))' }}
        >
          {/* Encabezado con estado satelital */}
          <header className="flex items-center justify-between bg-navy-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-2.5">
                <span className={`absolute inline-flex size-full animate-ping rounded-full ${isDelivered ? 'bg-mint-400' : 'bg-emerald-400'} opacity-75`} />
                <span className={`relative inline-flex size-2.5 rounded-full ${isDelivered ? 'bg-mint-400' : 'bg-emerald-400'}`} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                  {isDelivered ? 'Entrega Finalizada' : 'Telemetría GPS en Vivo'}
                </p>
                <p className="font-mono text-xs font-semibold text-slate-200">{orderNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToTracking}
                title="Ampliar a pantalla completa"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                aria-label="Ver en pantalla completa"
              >
                <Maximize2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                title="Minimizar panel GPS"
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                aria-label="Minimizar panel GPS"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>
          </header>

          {/* Mini Mapa Interactivo Leaflet */}
          <div
            onClick={goToTracking}
            title="Haz clic para ver el rastreo completo"
            className="relative h-44 w-full bg-slate-100 cursor-pointer overflow-hidden border-b border-slate-100 group"
          >
            <MapContainer
              center={truckPos}
              zoom={13}
              zoomControl={false}
              attributionControl={false}
              className="size-full pointer-events-auto"
              scrollWheelZoom={false}
              dragging={false}
            >
              <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
              <MiniMapHandler route={route} />

              {/* Marcador Hub */}
              <Marker position={[HUB.lat, HUB.lng]} icon={hubIcon} />

              {/* Marcador Domicilio Destino */}
              <Marker position={[destination.lat, destination.lng]} icon={homeIcon} />

              {/* Trazo de Ruta */}
              {route && (
                <>
                  <Polyline
                    positions={route.points}
                    pathOptions={{ color: '#0b1b33', weight: 4, opacity: 0.3 }}
                  />
                  <Polyline
                    positions={traveledPoints}
                    pathOptions={{ color: '#d4a843', weight: 4, opacity: 0.95 }}
                  />
                  <Marker position={truckPos} icon={truckIcon(headingEast)} zIndexOffset={500} />
                </>
              )}
            </MapContainer>

            {/* Overlay sutil al pasar cursor invitando a dar click */}
            <div className="absolute inset-x-0 bottom-0 z-[600] bg-navy-950/85 p-2 text-center text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Toca para abrir mapa en pantalla completa 📍
            </div>
          </div>

          {/* Barra de Controles de Simulación: Velocidad y Reinicio */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Velocidad:</span>
              <div role="group" aria-label="Velocidad de simulación" className="flex rounded-lg bg-slate-200/80 p-0.5">
                {[1, 4, 12].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      changeSpeed(s);
                    }}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition cursor-pointer ${
                      speed === s
                        ? 'bg-navy-900 text-gold-400 shadow-sm'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              title="Reiniciar simulación desde el inicio"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-navy-800 hover:bg-slate-200/80 transition cursor-pointer"
            >
              <RotateCcw className="size-3 text-navy-700" /> Reiniciar
            </button>
          </div>

          {/* Indicador de pasos / etapas dinámicas */}
          <div className="p-4 space-y-3 bg-white">
            {/* Barra de progreso visual */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-navy-900 flex items-center gap-1.5">
                  <currentStepInfo.icon className={`size-4 ${isDelivered ? 'text-mint-600' : 'text-gold-600'}`} />
                  {currentStepInfo.label}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-500">
                  {isDelivered ? '100%' : `${Math.round(progress * 100)}%`}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isDelivered ? 'bg-mint-500' : 'bg-gold-500'
                  }`}
                  style={{ width: `${isDelivered ? 100 : Math.max(6, progress * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5">{currentStepInfo.desc}</p>
            </div>

            {/* Mini Hitos interactivos */}
            <div className="grid grid-cols-5 gap-1 pt-1 border-t border-slate-100">
              {STAGES.map((s, idx) => {
                const isPassed = idx < stage || isDelivered;
                const isCurrent = idx === stage && !isDelivered;

                return (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <span
                      className={`grid size-7 place-items-center rounded-full text-xs transition-all ${
                        isPassed
                          ? 'bg-navy-900 text-gold-400'
                          : isCurrent
                          ? 'bg-gold-500 text-navy-950 font-bold ring-2 ring-gold-400 ring-offset-1 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <s.icon className="size-3.5" />
                    </span>
                    <span className={`mt-1 text-[9px] font-medium leading-tight text-center ${isPassed || isCurrent ? 'text-navy-900 font-bold' : 'text-slate-400'}`}>
                      {s.short}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Botón de acción principal hacia la pantalla de Rastrear */}
            <div className="pt-1">
              {isDelivered ? (
                <button
                  type="button"
                  onClick={goToTracking}
                  className="btn-gold w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 cursor-pointer animate-fade-in"
                >
                  <CircleCheck className="size-4" /> ¡Ver entrega exitosa! <ArrowRight className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToTracking}
                  className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Truck className="size-3.5 text-gold-400" /> Ver en rastreo completo <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
