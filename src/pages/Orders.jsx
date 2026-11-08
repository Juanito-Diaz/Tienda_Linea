import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  RotateCcw,
  Search,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Printer,
  ChevronDown,
  X,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useStore, formatMXN } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SmartImage } from '../components/ui';

export default function Orders() {
  const { orders } = useStore();
  const { currentUser } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(null);

  // Modal de solicitud de devolución estilo Amazon
  const [returnModalData, setReturnModalData] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  // Persistencia de solicitudes de devolución
  const [returns, setReturns] = useState(() => {
    try {
      const saved = localStorage.getItem('5a-returns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('5a-returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    if (!returnModalData) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setReturnModalData(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [returnModalData]);

  // Filtrado de pedidos
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.number.toLowerCase().includes(term) ||
      o.lines.some((l) => l.name.toLowerCase().includes(term) || l.brand.toLowerCase().includes(term));

    const isDelivered = (() => {
      try {
        const track = localStorage.getItem(`5a-track-${o.number}`);
        return track ? JSON.parse(track).delivered === true : false;
      } catch {
        return false;
      }
    })();

    if (filter === 'entregados') return matchesSearch && isDelivered;
    if (filter === 'transito') return matchesSearch && !isDelivered;
    return matchesSearch;
  });

  const confirmReturn = () => {
    if (!returnModalData || !returnReason) return;
    const { order, item } = returnModalData;
    const itemKey = `${order.number}_${item.key || item.productId || item.name}`;
    const trackingNumber = `GUIA-DEV-${Math.floor(10000 + Math.random() * 90000)}`;

    const newReturn = {
      orderNumber: order.number,
      productName: item.name,
      reason: returnReason,
      trackingNumber,
      createdAt: new Date().toISOString(),
      status: 'Recolección en camino',
    };

    setReturns((prev) => ({
      ...prev,
      [itemKey]: newReturn,
    }));

    setReturnSuccess({
      orderNumber: order.number,
      productName: item.name,
      trackingNumber,
    });

    toast({
      title: 'Solicitud de devolución registrada',
      description: `Guía ${trackingNumber} generada para ${item.name}.`,
      type: 'success',
    });

    setReturnModalData(null);
    setReturnReason('');
    setTimeout(() => setReturnSuccess(null), 8000);
  };

  const cancelReturn = (itemKey, productName) => {
    setReturns((prev) => {
      const copy = { ...prev };
      delete copy[itemKey];
      return copy;
    });
    toast({
      title: 'Devolución cancelada',
      description: `Se canceló la solicitud de devolución de ${productName}.`,
      type: 'info',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Encabezado estilo Amazon / Portal de Logística */}
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="section-title">Mis Pedidos y Devoluciones</h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentUser ? `Historial de compras de ${currentUser.nombre}` : 'Historial de compras recientes'}
            </p>
          </div>
          <Link to="/catalogo" className="btn-ghost">
            <ShoppingBag className="size-4" /> Seguir comprando
          </Link>
        </div>
      </header>

      {/* Barra de Filtros y Búsqueda de Pedidos */}
      {orders.length > 0 && (
        <div className="card mb-8 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'todos', label: `Todos los pedidos (${orders.length})` },
              { id: 'transito', label: 'En camino' },
              { id: 'entregados', label: 'Entregados' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`chip whitespace-nowrap ${
                  filter === tab.id
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-60 md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, marca o # orden..."
              className="input pl-9 text-xs"
            />
          </div>
        </div>
      )}

      {/* Alerta de devolución */}
      {returnSuccess && (
        <div className="mb-6 rounded-2xl border border-mint-200 bg-mint-50 p-4 text-mint-900 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-mint-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">¡Recolección programada con éxito!</p>
              <p>Un mensajero pasará a recoger <strong>{returnSuccess.productName}</strong> (Orden {returnSuccess.orderNumber}) sin costo adicional.</p>
            </div>
          </div>
        </div>
      )}

      {/* Listado de Pedidos */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = (() => {
              try {
                const track = localStorage.getItem(`5a-track-${order.number}`);
                return track ? JSON.parse(track).delivered === true : false;
              } catch {
                return false;
              }
            })();

            const dateStr = new Date(order.createdAt).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });

            return (
              <article key={order.number} className="card overflow-hidden transition hover:shadow-md">
                {/* Cabecera del pedido (Gris / Azul marino elegante como Amazon) */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                    <div>
                      <p className="uppercase font-semibold text-slate-400 tracking-wider text-[10px]">Pedido realizado</p>
                      <p className="font-medium text-navy-900 mt-0.5">{dateStr}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold text-slate-400 tracking-wider text-[10px]">Total</p>
                      <p className="font-bold text-navy-900 mt-0.5">{formatMXN(order.totals.total)}</p>
                    </div>
                    <div>
                      <p className="uppercase font-semibold text-slate-400 tracking-wider text-[10px]">Enviar a</p>
                      <p className="font-medium text-navy-900 mt-0.5">{order.shipping.nombre.split(' ')[0]}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="uppercase font-semibold text-slate-400 tracking-wider text-[10px]">Número de pedido</p>
                    <p className="font-mono font-bold text-navy-900 mt-0.5">{order.number}</p>
                  </div>
                </div>

                {/* Cuerpo del pedido */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Estado del pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`grid size-7 place-items-center rounded-full ${
                        isDelivered ? 'bg-mint-100 text-mint-700' : 'bg-gold-100 text-gold-700 animate-pulse'
                      }`}>
                        {isDelivered ? <CheckCircle2 className="size-4" /> : <Truck className="size-4" />}
                      </span>
                      <span className="font-bold text-sm sm:text-base text-navy-900">
                        {isDelivered ? 'Entregado en tu domicilio' : 'En camino · En ruta con el repartidor'}
                      </span>
                    </div>

                    <Link
                      to={`/rastreo/${encodeURIComponent(order.number)}`}
                      className="btn-gold py-2 px-4 text-xs font-semibold"
                    >
                      <Truck className="size-3.5" /> Rastrear paquete en vivo
                    </Link>
                  </div>

                  {/* Lista de productos en este pedido */}
                  <div className="divide-y divide-slate-100">
                    {order.lines.map((item, idx) => {
                      const itemKey = `${order.number}_${item.key || item.productId || item.name}`;
                      const returnInfo = returns[itemKey];

                      return (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-4">
                              <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                <SmartImage
                                  src={item.image}
                                  alt={item.name}
                                  className="size-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                                  {item.brand}
                                </p>
                                <h3 className="font-bold text-sm sm:text-base text-navy-900 hover:text-gold-700">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {item.variant ? `Opción: ${item.variant} · ` : ''} Cantidad: {item.qty}
                                </p>
                                <p className="text-xs font-bold text-navy-900 mt-1">
                                  {formatMXN(item.price)} c/u
                                </p>
                              </div>
                            </div>

                            {/* Botones de acción estilo Amazon */}
                            <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                              <Link
                                to={`/producto/${item.productId}`}
                                className="btn-ghost py-1.5 px-3 text-xs flex-1 sm:flex-initial text-center"
                              >
                                Volver a comprar
                              </Link>

                              {returnInfo ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">
                                  <RotateCcw className="size-3 text-amber-700 animate-spin-slow" /> Devolución en curso
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnReason('');
                                    setReturnModalData({ order, item });
                                  }}
                                  className="chip border-slate-200 bg-white text-slate-600 hover:border-coral-500 hover:text-coral-600 text-xs py-1.5 px-3 flex-1 sm:flex-initial text-center cursor-pointer"
                                >
                                  <RotateCcw className="size-3 mr-1 inline" /> Devolver producto
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Ficha de devolución activa estilo Amazon */}
                          {returnInfo && (
                            <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white p-3.5 sm:p-4 text-xs shadow-xs animate-fade-in">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/70 px-2 py-0.5 text-[11px] font-bold text-amber-950">
                                      <RotateCcw className="size-3" /> Devolución registrada
                                    </span>
                                    <span className="font-mono font-bold text-navy-900 text-xs">
                                      #{returnInfo.trackingNumber}
                                    </span>
                                  </div>
                                  <p className="text-slate-700">
                                    <span className="font-semibold text-slate-900">Motivo:</span> {returnInfo.reason}
                                  </p>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <CheckCircle2 className="size-3 text-mint-600" /> Recolección a domicilio programada con mensajería 5 a Logística. Reembolso automático a {order.payment.label}.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => cancelReturn(itemKey, item.name)}
                                  className="self-start sm:self-center text-xs font-semibold text-coral-600 hover:text-coral-700 hover:underline px-2 py-1 rounded cursor-pointer"
                                >
                                  Cancelar devolución
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pie del pedido */}
                <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-mint-600" /> Garantía de satisfacción 5 a Logística (30 días)
                  </span>
                  <span>Método de pago: <strong>{order.payment.label}</strong></span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Estado vacío si no hay compras */
        <div className="card my-12 mx-auto max-w-md p-8 sm:p-12 text-center animate-fade-in space-y-4">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-navy-50 text-navy-900">
            <Package className="size-8 text-gold-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            {searchTerm ? 'No encontramos coincidencias' : 'Aún no tienes pedidos registrados'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {searchTerm
              ? 'Prueba buscando con otro término o limpia los filtros de búsqueda.'
              : 'Explora nuestra selección de cosméticos de alta gama, ropa deportiva y café artesanal.'}
          </p>
          <div className="pt-2">
            <Link to="/catalogo" className="btn-gold w-full py-3">
              Ver catálogo de productos <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Modal Centro de Devoluciones estilo Amazon */}
      {returnModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-center-title"
          >
            {/* Barra superior estilo Amazon */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Centro de devoluciones
              </span>
              <button
                type="button"
                onClick={() => setReturnModalData(null)}
                className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg"
                aria-label="Cerrar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Contenido principal */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 id="return-center-title" className="text-xl sm:text-2xl font-bold text-navy-950">
                  Elige los productos a devolver
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pedido #{returnModalData.order.number} · Recolección gratuita en tu domicilio
                </p>
              </div>

              {/* Fila del producto y selector de motivo */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 flex flex-col md:flex-row items-start gap-6">
                {/* Producto */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="mt-1 size-4 rounded text-navy-900 border-slate-300 accent-navy-900 cursor-not-allowed"
                    title="Producto seleccionado"
                  />
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
                    <SmartImage
                      src={returnModalData.item.image}
                      alt={returnModalData.item.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                      {returnModalData.item.brand}
                    </p>
                    <h3 className="font-bold text-sm text-navy-900 leading-snug line-clamp-2">
                      {returnModalData.item.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      {formatMXN(returnModalData.item.price)}
                    </p>
                    {returnModalData.item.variant && (
                      <p className="text-[11px] text-slate-500">
                        Opción: {returnModalData.item.variant}
                      </p>
                    )}
                  </div>
                </div>

                {/* Acordeón / Dropdown de Motivo */}
                <div className="w-full md:w-72 shrink-0 space-y-2">
                  <label htmlFor="return-reason-select" className="block text-xs font-bold text-navy-900">
                    ¿Por qué razón devuelves este producto? <span className="text-coral-600 font-normal">(obligatorio)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="return-reason-select"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 shadow-xs focus:border-navy-900 focus:outline-hidden focus:ring-2 focus:ring-navy-900/10 cursor-pointer"
                    >
                      <option value="" disabled>
                        Elige una respuesta
                      </option>
                      <option value="Ya no lo necesito">Ya no lo necesito</option>
                      <option value="Llegó tarde">Llegó tarde</option>
                      <option value="La caja o sobre están bien, pero el producto dañado">
                        La caja o sobre están bien, pero el producto dañado
                      </option>
                      <option value="Incompatible o inadecuado">Incompatible o inadecuado</option>
                      <option value="El producto no cumple con las expectativas o tiene defectos">
                        El producto no cumple con las expectativas o tiene defectos
                      </option>
                      <option value="Pedido accidental / No es lo que pedí">
                        Pedido accidental / No es lo que pedí
                      </option>
                      <option value="Compra no autorizada">Compra no autorizada</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {returnReason ? (
                    <p className="text-[11px] text-mint-700 font-medium flex items-center gap-1 pt-1">
                      <CheckCircle2 className="size-3.5 shrink-0" /> Motivo registrado para la recolección
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Selecciona una opción para habilitar la confirmación.
                    </p>
                  )}
                </div>
              </div>

              {/* Caja de Políticas y Logística de Reembolso */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Truck className="size-4 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-navy-900">Recolección a domicilio sin costo: </span>
                    Un mensajero de 5 a Logística acudirá al domicilio de entrega original ({returnModalData.order.shipping.calle}, {returnModalData.order.shipping.colonia}). No necesitas imprimir etiquetas.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 text-mint-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-navy-900">Reembolso garantizado: </span>
                    Se reembolsará el importe de {formatMXN(returnModalData.item.price * returnModalData.item.qty)} automáticamente a tu {returnModalData.order.payment.label} en un lapso de 24 a 48 horas tras recibir el artículo.
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModalData(null)}
                  className="btn-ghost text-xs w-full sm:w-auto text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!returnReason}
                  onClick={confirmReturn}
                  className={`w-full sm:w-auto text-xs font-semibold py-2.5 px-6 rounded-full shadow-sm transition ${
                    returnReason
                      ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-500 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  Confirmar solicitud de devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
