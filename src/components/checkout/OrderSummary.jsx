import { Lock } from 'lucide-react';
import { formatMXN, PACKAGING, SHIPPING_FREE_FROM, useStore } from '../../context/StoreContext';

export default function OrderSummary({ children, compact = false }) {
  const { lines, totals, packaging } = useStore();
  const remaining = SHIPPING_FREE_FROM - totals.subtotal;

  return (
    <aside className="card sticky top-36 space-y-4 p-6" aria-label="Resumen del pedido">
      <h2 className="text-lg font-bold text-navy-900">Resumen del pedido</h2>
      {!compact && (
        <ul className="max-h-56 space-y-3 overflow-y-auto pt-2 pb-1 px-1">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3 text-sm">
              <span className="relative shrink-0">
                <img src={l.product.images[0].replace('w=1000', 'w=120')} alt="" className="size-12 rounded-lg object-cover" />
                <span className="absolute -right-1.5 -top-1.5 grid min-w-5 h-5 px-1 place-items-center rounded-full bg-navy-900 text-[10px] font-bold text-white leading-none shadow-sm">{l.qty}</span>
              </span>
              <span className="line-clamp-2 flex-1 text-slate-600">{l.product.name}</span>
              <span className="font-semibold text-navy-900">{formatMXN(l.total)}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-slate-500">Subtotal ({totals.count} art.)</dt><dd>{formatMXN(totals.base)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">IVA (16%)</dt><dd>{formatMXN(totals.tax)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">{PACKAGING[packaging].label}</dt><dd>{totals.pack ? formatMXN(totals.pack) : 'Gratis'}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">Envío</dt><dd className={totals.shipping ? '' : 'font-semibold text-mint-500'}>{totals.shipping ? formatMXN(totals.shipping) : 'Gratis'}</dd></div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-navy-900"><dt>Total</dt><dd>{formatMXN(totals.total)}</dd></div>
      </dl>
      {remaining > 0 && totals.subtotal > 0 && (
        <div className="rounded-xl bg-gold-100 p-3 text-xs text-gold-700">
          Te faltan <strong>{formatMXN(remaining)}</strong> para envío gratis
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${Math.min(100, (totals.subtotal / SHIPPING_FREE_FROM) * 100)}%` }} />
          </div>
        </div>
      )}
      {children}
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><Lock className="size-3" /> Compra segura · cifrado SSL de 256 bits</p>
    </aside>
  );
}
