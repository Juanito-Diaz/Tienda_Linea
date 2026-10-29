import { useState } from 'react';
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

  const handleReturnRequest = (orderNumber, productName) => {
    setReturnSuccess({ orderNumber, productName });
    toast({
      title: 'Solicitud de devolución registrada',
      description: `Se ha generado la guía de recolección para ${productName}.`,
      type: 'info',
    });
    setTimeout(() => setReturnSuccess(null), 5000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Encabezado estilo Amazon / Portal de Logística */}
      <header className="mb-8">
        <nav aria-label="Navegación" className="mb-2 text-xs text-slate-500">
          Inicio / Mi Cuenta / <span className="text-navy-900 font-semibold">Devoluciones y Pedidos</span>
        </nav>
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
                    {order.lines.map((item, idx) => (
                      <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
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
                          <button
                            type="button"
                            onClick={() => handleReturnRequest(order.number, item.name)}
                            className="chip border-slate-200 bg-white text-slate-600 hover:border-coral-500 hover:text-coral-600 text-xs py-1.5 px-3 flex-1 sm:flex-initial text-center cursor-pointer"
                          >
                            <RotateCcw className="size-3 mr-1 inline" /> Devolver producto
                          </button>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}
