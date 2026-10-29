import { Link } from 'react-router-dom';
import { CircleCheck, MapPin, MoveHorizontal, Printer, Truck } from 'lucide-react';
import { formatMXN, PACKAGING } from '../../context/StoreContext';
import { MOLIENDAS } from '../../data/products';
import { DELIVERY } from './ShippingStep';

export default function ConfirmationStep({ order }) {
  const s = order.shipping;
  const t = order.totals;
  const date = new Date(order.createdAt);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24 sm:pb-8">
      <div className="no-print text-center animate-fade-up">
        <span className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-mint-500/10">
          <CircleCheck className="size-12 text-mint-500" />
        </span>
        <h2 className="font-display text-3xl font-bold text-navy-900">¡Gracias por tu compra, {s.nombre.split(' ')[0]}!</h2>
        <p className="mt-2 text-slate-500">Tu pedido fue confirmado y ya está en la fila de preparación del 5 a Logística Hub.</p>
      </div>

      <article className="card print-area overflow-hidden" aria-label="Comprobante del pedido">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-navy-900 p-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-300">Número de orden</p>
            <p className="font-mono text-2xl font-bold tracking-wide">{order.number}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-display text-lg font-bold">Tienda en línea</p>
            <p className="text-slate-300">{date.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
        </header>

        <div className="grid gap-6 border-b border-slate-100 p-6 text-sm sm:grid-cols-2">
          <div>
            <h3 className="label flex items-center gap-1.5"><MapPin className="size-3.5" /> Entrega</h3>
            <p className="font-semibold text-navy-900">{s.nombre}</p>
            <p className="text-slate-600">{s.calle} {s.numero}, Col. {s.colonia}</p>
            <p className="text-slate-600">C.P. {s.cp}, {s.ciudad}, {s.estado}</p>
            <p className="text-slate-600">{s.telefono} · {s.email}</p>
          </div>
          <div>
            <h3 className="label flex items-center gap-1.5"><Truck className="size-3.5" /> Envío y pago</h3>
            <p className="text-slate-600">{DELIVERY[s.entrega]?.label}{s.fecha ? ` · ${s.fecha}` : ''}</p>
            <p className="text-slate-600">{PACKAGING[order.packaging].label}</p>
            <p className="mt-2 font-semibold text-navy-900">{order.payment.label}</p>
            <p className="text-slate-600">{order.payment.detail}</p>
          </div>
        </div>

        {/* Indicador visual para pantallas móviles */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs text-slate-500 sm:hidden">
          <span className="flex items-center gap-1.5 font-medium text-navy-800">
            <MoveHorizontal className="size-3.5 text-navy-600 animate-pulse" /> Desliza a los lados para ver todo el detalle
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">4 columnas</span>
        </div>

        {/* Contenedor con scroll horizontal táctil suave */}
        <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Desglose de artículos</caption>
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-3 py-3 text-center font-semibold">Cant.</th>
                <th className="px-4 py-3 text-right font-semibold">P. unitario</th>
                <th className="px-5 py-3 text-right font-semibold">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.lines.map((l) => (
                <tr key={l.key} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-navy-900">{l.name}</p>
                    <p className="text-xs text-slate-500">{[l.brand, l.variant, l.extra && MOLIENDAS[l.extra]].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className="px-3 py-3.5 text-center font-medium text-navy-900">{l.qty}</td>
                  <td className="px-4 py-3.5 text-right text-slate-600">{formatMXN(l.price)}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-navy-900">{formatMXN(l.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm bg-slate-50/40">
              {[['Subtotal (sin IVA)', t.base], ['IVA 16%', t.tax], ['Empaque', t.pack], ['Envío', t.shipping]].map(([k, v]) => (
                <tr key={k}>
                  <td colSpan={3} className="px-5 pt-2.5 pb-1 text-right text-slate-500">{k}</td>
                  <td className="px-5 pt-2.5 pb-1 text-right font-medium text-slate-700">{v ? formatMXN(v) : 'Gratis'}</td>
                </tr>
              ))}
              <tr className="text-base font-bold text-navy-900 bg-navy-50/50">
                <td colSpan={3} className="px-5 py-4 text-right">Total pagado</td>
                <td className="px-5 py-4 text-right text-lg text-navy-950 font-display">{formatMXN(t.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </article>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Link to={`/rastreo/${encodeURIComponent(order.number)}`} className="btn-gold px-6 py-3 text-base"><Truck className="size-5" /> Rastrear mi pedido en vivo</Link>
        <button type="button" onClick={() => window.print()} className="btn-ghost px-6 py-3 text-base"><Printer className="size-5" /> Imprimir comprobante</button>
        <Link to="/catalogo" className="btn-ghost px-6 py-3 text-base">Seguir comprando</Link>
      </div>
    </div>
  );
}
