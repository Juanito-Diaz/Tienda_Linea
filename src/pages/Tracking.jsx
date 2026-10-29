import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import {
  Box,
  CircleCheck,
  Clock,
  Crosshair,
  LoaderCircle,
  MapPin,
  Package,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Search,
  Star,
  Truck,
  TriangleAlert,
  Warehouse,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { useStore, formatMXN } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { buildRoute, DEMO_DESTINATION, fetchRoute, HUB, pointAt } from '../lib/geo';
import { homeIcon, hubIcon, TILE_ATTRIBUTION, TILE_URL, truckIcon } from '../lib/mapIcons';
import IncidentDialog from '../components/IncidentDialog';
import {
  PREP_START,
  DEPART,
  TRAVEL,
  TOTAL_TRACKING_TIME,
  getTrackingState,
  saveTrackingState,
  initOrderTracking,
  computeSimTime,
  playDeliveryChime,
  sendBrowserNotification,
} from '../lib/trackingManager';

const FINAL_LEG = 0.75; // % de ruta a partir del cual es "ruta final"

function MapResizeHandler({ route }) {
  const map = useMap();
  useEffect(() => {
    // Forzar a Leaflet a recalcular el tamaño del contenedor y rellenar todo el espacio
    const resize = () => {
      map.invalidateSize();
      if (route && route.points?.length) {
        map.fitBounds(route.points, { padding: [50, 50] });
      }
    };
    resize();
    const t1 = setTimeout(resize, 100);
    const t2 = setTimeout(resize, 350);
    const t3 = setTimeout(resize, 800);

    const container = map.getContainer();
    let ro;
    if (typeof ResizeObserver !== 'undefined' && container) {
      ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (ro) ro.disconnect();
    };
  }, [map, route]);
  return null;
}

export const MILESTONES = [
  { label: 'Pedido recibido', icon: Package, desc: 'Confirmamos tu pago y orden' },
  { label: 'En preparación y empaque', icon: Box, desc: 'Picking y empaque especializado en el Hub' },
  { label: 'En tránsito', icon: Truck, desc: 'La camioneta salió del 5 a Logística Hub' },
  { label: 'En ruta final de entrega', icon: MapPin, desc: 'Tu repartidor está a pocos minutos' },
  { label: 'Entregado', icon: CircleCheck, desc: '¡Disfruta tu pedido!' },
];

const DRIVERS_BY_CATEGORY = {
  maquillaje: {
    name: 'Valeria Sotomayor',
    phone: '+52 55 8765 4321',
    vehicle: 'Renault Kangoo E-Tech (Control Térmico) · Placas 5AL-772M',
    rating: 4.95,
    deliveries: 1420,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    specialty: 'Especialista en cosmética y frágiles',
  },
  deportiva: {
    name: 'Carlos Méndez',
    phone: '+52 55 4321 8765',
    vehicle: 'Nissan NV200 · Placas 5AL-284B',
    rating: 4.9,
    deliveries: 1834,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    specialty: 'Ruta exprés deportiva',
  },
  cafe: {
    name: 'Mateo Sandoval',
    phone: '+52 55 3344 5566',
    vehicle: 'Volkswagen Caddy Eco · Placas 5AL-918C',
    rating: 4.98,
    deliveries: 2150,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    specialty: 'Especialista en tueste y granos selectos',
  },
  default: {
    name: 'Rodrigo Alarcón',
    phone: '+52 55 9988 7766',
    vehicle: 'Mercedes-Benz eVito · Placas 5AL-501A',
    rating: 4.88,
    deliveries: 980,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    specialty: 'Reparto multirrubro',
  },
};

function getDriverForOrder(order) {
  if (!order || !order.lines || order.lines.length === 0) {
    return DRIVERS_BY_CATEGORY.default;
  }
  const firstCategory = order.lines[0]?.category || (order.lines[0]?.product?.category);
  return DRIVERS_BY_CATEGORY[firstCategory] || DRIVERS_BY_CATEGORY.default;
}

const stageAt = (t, progress) => {
  if (progress >= 1) return 4;
  if (progress >= FINAL_LEG) return 3;
  if (t >= DEPART) return 2;
  if (t >= PREP_START) return 1;
  return 0;
};

export default function Tracking() {
  const { order: orderParam } = useParams();
  const navigate = useNavigate();
  const { orders } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState(orderParam ? decodeURIComponent(orderParam) : '');
  const [notFound, setNotFound] = useState(false);

  const order = useMemo(() => {
    if (orderParam) {
      return orders.find((o) => o.number === decodeURIComponent(orderParam)) ?? null;
    }
    return orders[0] ?? null;
  }, [orderParam, orders]);

  const destination = order?.shipping?.coords ?? null;
  const destLabel = order ? `${order.shipping.calle} ${order.shipping.numero}, ${order.shipping.colonia}` : '';
  const orderNumber = order?.number ?? '';

  // ---------- Ruta ----------
  const [route, setRoute] = useState(null);
  const [routeSource, setRouteSource] = useState('');
  const [realDuration, setRealDuration] = useState(0);

  useEffect(() => {
    if (!destination) {
      setRoute(null);
      return;
    }
    const ctrl = new AbortController();
    setRoute(null);
    fetchRoute([HUB.lat, HUB.lng], [destination.lat, destination.lng], ctrl.signal)
      .then((r) => {
        const built = buildRoute(r.points);
        setRoute(built);
        setRouteSource(r.source);
        // Duración real estimada: OSRM o 24 km/h promedio urbano
        setRealDuration(r.duration ? r.duration * 1.35 : built.length / (24000 / 3600));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [destination]);

  // Clave e inicialización en localStorage para el rastreo persistente
  useEffect(() => {
    if (order?.number) {
      initOrderTracking(order.number);
    }
  }, [order?.number]);

  const initialSimTime = useMemo(() => {
    if (!order?.number) return 0;
    const track = getTrackingState(order.number);
    if (!track) return 0;
    return computeSimTime(track);
  }, [order?.number]);

  const trackData = order ? getTrackingState(order.number) : null;
  const isAlreadyDelivered = trackData?.delivered === true || initialSimTime >= TOTAL_TRACKING_TIME;

  // ---------- Simulación ----------
  const [playing, setPlaying] = useState(!isAlreadyDelivered && !(trackData?.paused));
  const [speed, setSpeed] = useState(trackData?.speed || 1);
  const [follow, setFollow] = useState(!isAlreadyDelivered);
  const [simTime, setSimTime] = useState(initialSimTime);
  const [events, setEvents] = useState(() => {
    if (isAlreadyDelivered) {
      const orderDate = new Date(order.createdAt);
      return MILESTONES.map((_, i) => ({
        stage: i,
        at: new Date(orderDate.getTime() + i * 180000), // Intervalos de 3 min
      })).reverse();
    }
    return [];
  });

  const simRef = useRef(initialSimTime);
  const mapRef = useRef(null);
  const truckRef = useRef(null);
  const traveledRef = useRef(null);
  const lastEastRef = useRef(null);
  const stageRef = useRef(isAlreadyDelivered ? 4 : stageAt(initialSimTime, Math.max(0, (initialSimTime - DEPART) / TRAVEL)));
  const followRef = useRef(follow);
  followRef.current = follow;

  const progress = Math.max(0, Math.min(1, (simTime - DEPART) / TRAVEL));
  const stage = isAlreadyDelivered ? 4 : stageAt(simTime, progress);

  // Escuchar actualizaciones del servicio de fondo (BackgroundTrackingNotifier)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.orderNumber === order?.number) {
        if (e.detail.delivered) {
          simRef.current = TOTAL_TRACKING_TIME;
          setSimTime(TOTAL_TRACKING_TIME);
          setPlaying(false);
        }
      }
    };
    window.addEventListener('5a-tracking-update', handler);
    return () => window.removeEventListener('5a-tracking-update', handler);
  }, [order?.number]);

  // Si se detecta entrega, asegurar guardado
  useEffect(() => {
    if (order?.number && stage === 4) {
      saveTrackingState(order.number, {
        accumulatedTime: TOTAL_TRACKING_TIME,
        lastTick: Date.now(),
        delivered: true,
        deliveredAt: new Date().toISOString(),
      });
    }
  }, [order?.number, stage]);

  const restart = useCallback(() => {
    if (order?.number) {
      saveTrackingState(order.number, {
        accumulatedTime: 0,
        lastTick: Date.now(),
        startTime: Date.now(),
        speed,
        paused: false,
        delivered: false,
        notified: false,
      });
    }
    simRef.current = 0;
    stageRef.current = -1;
    setSimTime(0);
    setEvents([]);
    setPlaying(true);
    setFollow(true);
  }, [order?.number, speed]);

  const togglePlay = () => {
    setPlaying((p) => {
      const next = !p;
      if (order?.number) {
        saveTrackingState(order.number, {
          paused: !next,
          accumulatedTime: simRef.current,
          lastTick: Date.now(),
        });
      }
      return next;
    });
  };

  const changeSpeed = (s) => {
    setSpeed(s);
    if (order?.number) {
      saveTrackingState(order.number, {
        speed: s,
        accumulatedTime: simRef.current,
        lastTick: Date.now(),
      });
    }
  };

  // Posicionar camión en la ruta inicial sin reiniciar la simulación
  useEffect(() => {
    if (route && route.points?.length) {
      const p = Math.max(0, (simRef.current - DEPART) / TRAVEL);
      const { pos, index, headingEast } = pointAt(route, p);
      if (truckRef.current) {
        truckRef.current.setLatLng(pos);
        truckRef.current.setIcon(truckIcon(headingEast));
        lastEastRef.current = headingEast;
      }
      traveledRef.current?.setLatLngs([...route.points.slice(0, index), pos]);
      if (mapRef.current) {
        if (p === 0 || p === 1) {
          mapRef.current.fitBounds(route.points, { padding: [50, 50] });
        } else {
          mapRef.current.panTo(pos);
        }
      }
    }
  }, [route]);

  // Registra eventos al cambiar de hito
  useEffect(() => {
    if (stage === stageRef.current) return;
    for (let s = stageRef.current + 1; s <= stage; s++) {
      setEvents((e) => [{ stage: s, at: new Date() }, ...e]);
      if (s >= 2) {
        toast({ title: MILESTONES[s].label, description: MILESTONES[s].desc, type: s === 4 ? 'success' : 'info' });
        if (s === 4) {
          playDeliveryChime();
          sendBrowserNotification('¡Tu paquete ha llegado! 📦🎉', `El pedido ${order?.number} fue entregado con éxito.`);
        }
      }
    }
    stageRef.current = stage;
  }, [stage, toast, order?.number]);

  // Bucle de animación: mueve el marcador imperativamente (60 fps) y sincroniza la UI (~10 fps)
  useEffect(() => {
    if (!route || !playing) return;
    let raf;
    let last = performance.now();
    let lastUi = 0;
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      simRef.current = Math.min(simRef.current + dt * speed, TOTAL_TRACKING_TIME);
      const p = Math.max(0, (simRef.current - DEPART) / TRAVEL);
      const { pos, index, headingEast } = pointAt(route, p);

      const truck = truckRef.current;
      if (truck) {
        truck.setLatLng(pos);
        if (headingEast !== lastEastRef.current) {
          truck.setIcon(truckIcon(headingEast));
          lastEastRef.current = headingEast;
        }
      }
      traveledRef.current?.setLatLngs([...route.points.slice(0, index), pos]);

      if (now - lastUi > 100) {
        lastUi = now;
        setSimTime(simRef.current);
        if (followRef.current && p > 0 && p < 1) mapRef.current?.panTo(pos, { animate: true, duration: 0.5 });
        if (order?.number) {
          saveTrackingState(order.number, {
            accumulatedTime: simRef.current,
            lastTick: Date.now(),
            speed,
            paused: false,
            delivered: simRef.current >= TOTAL_TRACKING_TIME,
          });
        }
      }
      if (simRef.current >= TOTAL_TRACKING_TIME) {
        setSimTime(TOTAL_TRACKING_TIME);
        setPlaying(false);
        if (order?.number) {
          saveTrackingState(order.number, {
            accumulatedTime: TOTAL_TRACKING_TIME,
            lastTick: Date.now(),
            delivered: true,
            deliveredAt: new Date().toISOString(),
          });
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route, playing, speed, order?.number]);

  // Encuadra toda la ruta al cargar
  useEffect(() => {
    if (route && mapRef.current) mapRef.current.fitBounds(route.points, { padding: [50, 50] });
  }, [route]);

  // ---------- ETA ----------
  const remainingTravel = (1 - progress) * realDuration;
  const prepRemaining = simTime < DEPART ? ((DEPART - simTime) / DEPART) * 25 * 60 : 0; // hasta 25 min de preparación
  const etaSeconds = stage === 4 ? 0 : remainingTravel + prepRemaining;
  const etaClock = new Date(Date.now() + etaSeconds * 1000).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const remainingKm = route ? ((1 - progress) * route.length) / 1000 : 0;

  // ---------- Incidencias ----------
  const incidentRef = useRef(null);

  const search = (e) => {
    e.preventDefault();
    let q = query.trim().toUpperCase();
    if (!q) return;
    if (!q.startsWith('#')) q = '#' + q;
    const found = orders.find((o) => o.number === q);
    setNotFound(!found);
    if (found) navigate(`/rastreo/${encodeURIComponent(found.number)}`);
  };

  const initialPos = route
    ? (isAlreadyDelivered ? route.points[route.points.length - 1] : route.points[0])
    : [HUB.lat, HUB.lng];

  const driver = useMemo(() => getDriverForOrder(order), [order]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gold-600">
            <span className="size-2 animate-pulse rounded-full bg-mint-500" /> Seguimiento GPS en vivo
          </p>
          <h1 className="section-title">Rastreo de pedido</h1>
          {order && (
            <p className="mt-1 font-mono text-lg font-semibold text-navy-700">
              {orderNumber}
            </p>
          )}
        </div>
        {orders.length > 0 && (
          <form onSubmit={search} className="flex w-full max-w-sm gap-2" role="search">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="#5A-LOG-12345" aria-label="Número de orden" className="input font-mono" />
            <button className="btn-primary" aria-label="Buscar orden"><Search className="size-4" /></button>
          </form>
        )}
      </header>

      {/* Si no hay pedidos en esta cuenta: Estado vacío sin simulación */}
      {!order ? (
        <div className="card my-8 mx-auto max-w-md p-8 sm:p-12 text-center animate-fade-in space-y-4">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-800">
            <ShoppingBag className="size-8 text-gold-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            No tienes pedidos activos para rastrear
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Cuando realices una compra en la tienda, aquí podrás ver en tiempo real el mapa con la camioneta de reparto avanzando hacia tu domicilio.
          </p>
          <div className="pt-2">
            <Link to="/catalogo" className="btn-gold w-full py-3">
              Ir a la tienda y comprar <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : isAlreadyDelivered ? (
        /* Pantalla final de pedido entregado: ya no muestra el mapa ni la camioneta */
        <div className="space-y-8 animate-fade-in">
          <div className="card border-mint-200 bg-gradient-to-br from-mint-50/70 via-white to-white p-8 text-center sm:p-12 shadow-sm">
            <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-mint-500 text-white shadow-xl shadow-mint-500/25">
              <CircleCheck className="size-10" />
            </div>
            <span className="inline-block rounded-full bg-mint-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-mint-800">
              Entrega completada con éxito
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              ¡Este pedido ya fue entregado!
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm sm:text-base text-slate-600">
              El paquete con la orden <strong>{order.number}</strong> fue recibido en{' '}
              <strong>{destLabel}</strong>. Esperamos que disfrutes tu compra.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/pedidos" className="btn-primary py-3 px-6 text-sm">
                <Package className="size-4" /> Ver en Devoluciones y Pedidos
              </Link>
              <Link to="/catalogo" className="btn-ghost py-3 px-6 text-sm">
                <ShoppingBag className="size-4" /> Comprar otro producto
              </Link>
            </div>
          </div>

          {/* Resumen de los artículos entregados */}
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-navy-900">Artículos de esta entrega</h3>
                <p className="text-xs text-slate-500">{order.lines.reduce((s, l) => s + l.qty, 0)} productos entregados por {driver.name}</p>
              </div>
              <span className="font-mono font-bold text-navy-900 text-sm">{formatMXN(order.totals.total)}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {order.lines.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 bg-slate-50/50">
                  <img src={item.image} alt={item.name} className="size-14 rounded-xl object-cover shrink-0 border border-slate-200" />
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold text-navy-900 truncate">{item.name}</p>
                    <p className="text-slate-500">{item.brand} · Cant: {item.qty}</p>
                    <p className="font-semibold text-navy-900 mt-1">{formatMXN(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {notFound && (
            <p role="alert" className="mb-4 rounded-xl bg-coral-500/10 p-3 text-sm text-coral-500">
              No encontramos esa orden. Mostrando tu pedido activo más reciente.
            </p>
          )}

          {orders.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {orders.slice(0, 5).map((o) => (
                <Link
                  key={o.number}
                  to={`/rastreo/${encodeURIComponent(o.number)}`}
                  className={`chip font-mono ${o.number === order?.number ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white hover:border-navy-900'}`}
                >
                  {o.number}
                </Link>
              ))}
            </div>
          )}

      {/* Barra de hitos */}
      <section aria-label="Estado del envío" className="card mb-6 p-5 md:p-6">
        <ol className="grid grid-cols-5 gap-1">
          {MILESTONES.map((m, i) => {
            const done = i < stage || stage === 4;
            const active = i === stage && stage !== 4;

            return (
              <li key={m.label} className="relative flex flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
                {i > 0 && (
                  <span className="absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 bg-slate-200" aria-hidden>
                    <span className={`block h-full bg-gold-500 transition-all duration-700 ${i <= stage ? 'w-full' : 'w-0'}`} />
                  </span>
                )}
                <span className={`relative z-10 grid size-10 place-items-center rounded-full transition-all duration-500 ${done ? 'bg-gold-500 text-navy-950' : active ? 'bg-navy-900 text-gold-400 animate-pulse-ring' : 'bg-slate-200 text-slate-400'}`}>
                  <m.icon className="size-5" />
                </span>
                <span className={`mt-2 text-[11px] font-semibold leading-tight sm:text-sm ${done || active ? 'text-navy-900' : 'text-slate-400'}`}>{m.label}</span>
                {active && <span className="mt-0.5 hidden text-xs text-gold-700 md:block">En curso…</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Mapa */}
        <section className="card relative overflow-hidden" aria-label="Mapa de ruta">
          <div className="h-[28rem] md:h-[34rem] w-full relative">
            <MapContainer ref={mapRef} center={[19.45, -99.16]} zoom={12} className="size-full" scrollWheelZoom>
              <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
              <MapResizeHandler route={route} />
              <Marker position={[HUB.lat, HUB.lng]} icon={hubIcon}>
                <Popup><strong>{HUB.name}</strong><br />{HUB.address}</Popup>
              </Marker>
              <Marker position={[destination.lat, destination.lng]} icon={homeIcon}>
                <Popup><strong>Tu domicilio</strong><br />{destLabel}</Popup>
              </Marker>
              {route && (
                <>
                  <Polyline positions={route.points} pathOptions={{ color: '#0b1b33', weight: 6, opacity: 0.25 }} />
                  <Polyline positions={route.points} pathOptions={{ color: '#2d4f86', weight: 3, dashArray: '6 8' }} />
                  <Polyline
                    ref={traveledRef}
                    positions={isAlreadyDelivered ? route.points : [route.points[0]]}
                    pathOptions={{ color: '#d4a843', weight: 6 }}
                  />
                  <Marker ref={truckRef} position={initialPos} icon={truckIcon(false)} zIndexOffset={1000}>
                    <Popup><strong>{driver.name}</strong><br />{driver.vehicle}</Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          </div>

          {!route && (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/70 backdrop-blur-sm">
              <p className="flex items-center gap-2 font-medium text-navy-900"><LoaderCircle className="size-5 animate-spin" /> Calculando ruta óptima…</p>
            </div>
          )}

          {/* Controles del simulador */}
          <div className="absolute inset-x-3 bottom-3 z-[500] flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur">
            <button type="button" onClick={() => (simTime >= TOTAL_TRACKING_TIME ? restart() : togglePlay())} className="grid size-10 place-items-center rounded-xl bg-navy-900 text-gold-400 hover:bg-navy-700" aria-label={playing ? 'Pausar simulación' : 'Reproducir simulación'}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button type="button" onClick={restart} className="grid size-10 place-items-center rounded-xl text-navy-900 hover:bg-slate-100" aria-label="Reiniciar simulación">
              <RotateCcw className="size-4" />
            </button>
            <div role="group" aria-label="Velocidad de simulación" className="flex rounded-xl bg-slate-100 p-1">
              {[1, 4, 12].map((s) => (
                <button key={s} type="button" onClick={() => changeSpeed(s)} aria-pressed={speed === s} className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${speed === s ? 'bg-white text-navy-900 shadow' : 'text-slate-500'}`}>
                  {s}x
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setFollow((f) => !f)} aria-pressed={follow} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${follow ? 'bg-gold-100 text-gold-700' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Crosshair className="size-4" /> Seguir camioneta
            </button>
            <div className="ml-auto flex min-w-28 flex-1 items-center gap-2 sm:max-w-48">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="w-10 text-right font-mono text-xs font-semibold text-navy-900">{Math.round(progress * 100)}%</span>
            </div>
          </div>
          {routeSource === 'synthetic' && (
            <p className="absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-1.5 text-xs text-slate-500 shadow">Ruta aproximada (servicio de rutas no disponible)</p>
          )}
        </section>

        {/* Panel lateral */}
        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-navy-900 to-navy-950 p-5 text-white">
              <p className="text-xs uppercase tracking-widest text-gold-300">{stage === 4 ? 'Entregado a las' : 'Llegada estimada'}</p>
              <p className="font-display text-4xl font-bold">{stage === 4 ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : etaClock}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300" aria-live="polite">
                <Clock className="size-4" />
                {stage === 4 ? '¡Tu pedido ha llegado!' : `en ~${Math.max(1, Math.round(etaSeconds / 60))} min · ${remainingKm.toFixed(1)} km restantes`}
              </p>
            </div>
            <dl className="grid grid-cols-2 divide-x divide-slate-100 text-center text-sm">
              <div className="p-3"><dt className="text-xs text-slate-500">Estado</dt><dd className="font-semibold text-navy-900">{MILESTONES[stage].label}</dd></div>
              <div className="p-3"><dt className="text-xs text-slate-500">Destino</dt><dd className="truncate font-semibold text-navy-900" title={destLabel}>{destLabel}</dd></div>
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="label">Repartidor asignado</h2>
            <div className="flex items-center gap-3">
              <img src={driver.photo} alt="" className="size-14 rounded-full object-cover ring-2 ring-gold-500" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900 truncate">{driver.name}</p>
                <p className="text-[11px] font-bold text-gold-700">{driver.specialty}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5"><Star className="size-3.5 fill-gold-500 text-gold-500" /> {driver.rating} · {driver.deliveries.toLocaleString('es-MX')} entregas</p>
                <p className="text-xs text-slate-500 truncate">{driver.vehicle}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`tel:${driver.phone.replace(/\s/g, '')}`} className="btn-primary px-3"><Phone className="size-4" /> Llamar</a>
              <a href={`https://wa.me/${driver.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="btn-ghost px-3"><MessageCircle className="size-4" /> Mensaje</a>
            </div>
            <p className="mt-2 text-center font-mono text-xs text-slate-500">{driver.phone}</p>
          </div>

          <button type="button" onClick={() => incidentRef.current?.showModal()} className="btn w-full border-2 border-coral-500/30 bg-coral-500/5 py-3 text-coral-500 hover:bg-coral-500/10">
            <TriangleAlert className="size-4" /> Reportar una incidencia
          </button>

          <div className="card p-5">
            <h2 className="label">Historial del envío</h2>
            <ol className="relative space-y-4 border-l-2 border-slate-200 pl-6">
              {events.map((ev) => (
                <li key={ev.stage} className="relative animate-fade-up">
                  <span className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full bg-gold-500 ring-4 ring-white" />
                  <p className="text-sm font-bold text-navy-900 leading-snug">
                    {MILESTONES[ev.stage].label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ev.at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {ev.stage <= 1 ? HUB.name : MILESTONES[ev.stage].desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {order && (
            <div className="card flex items-center gap-3 p-5 text-sm">
              <Warehouse className="size-8 text-navy-300" />
              <div>
                <p className="font-semibold text-navy-900">{order.lines.reduce((s, l) => s + l.qty, 0)} artículos · {formatMXN(order.totals.total)}</p>
                <p className="text-xs text-slate-500">{order.payment.label}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <IncidentDialog ref={incidentRef} orderNumber={orderNumber} />
    </>
  )}
</div>
  );
}
