import { Link } from 'react-router-dom';
import { CircleCheck, MapPin, Printer, Truck } from 'lucide-react';
import { formatMXN, PACKAGING } from '../../context/StoreContext';
import { MOLIENDAS } from '../../data/products';
import { DELIVERY } from './ShippingStep';

export default function ConfirmationStep({ order }) {
  const s = order.shipping;
  const t = order.totals;
  const date = new Date(order.createdAt);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
            <p className="font-display text-lg font-bold">5 a Logística</p>
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

        <table className="w-full text-sm">
          <caption className="sr-only">Desglose de artículos</caption>
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-6 py-3 font-semibold">Producto</th><th className="px-3 py-3 text-center font-semibold">Cant.</th><th className="px-3 py-3 text-right font-semibold">P. unitario</th><th className="px-6 py-3 text-right font-semibold">Importe</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.lines.map((l) => (
              <tr key={l.key}>
                <td className="px-6 py-3">
                  <p className="font-medium text-navy-900">{l.name}</p>
                  <p className="text-xs text-slate-500">{[l.brand, l.variant, l.extra && MOLIENDAS[l.extra]].filter(Boolean).join(' · ')}</p>
                </td>
                <td className="px-3 py-3 text-center">{l.qty}</td>
                <td className="px-3 py-3 text-right">{formatMXN(l.price)}</td>
                <td className="px-6 py-3 text-right font-semibold">{formatMXN(l.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-sm">
            {[['Subtotal (sin IVA)', t.base], ['IVA 16%', t.tax], ['Empaque', t.pack], ['Envío', t.shipping]].map(([k, v]) => (
              <tr key={k}><td colSpan={3} className="px-6 pt-2 text-right text-slate-500">{k}</td><td className="px-6 pt-2 text-right">{v ? formatMXN(v) : 'Gratis'}</td></tr>
            ))}
            <tr className="text-base font-bold text-navy-900"><td colSpan={3} className="px-6 py-4 text-right">Total pagado</td><td className="px-6 py-4 text-right">{formatMXN(t.total)}</td></tr>
          </tfoot>
        </table>
      </article>

      <div className="no-print flex flex-wrap justify-center gap-3">
        <Link to={`/rastreo/${encodeURIComponent(order.number)}`} className="btn-gold px-6 py-3 text-base"><Truck className="size-5" /> Rastrear mi pedido en vivo</Link>
        <button type="button" onClick={() => window.print()} className="btn-ghost px-6 py-3 text-base"><Printer className="size-5" /> Imprimir comprobante</button>
        <Link to="/catalogo" className="btn-ghost px-6 py-3 text-base">Seguir comprando</Link>
      </div>
    </div>
  );
}
