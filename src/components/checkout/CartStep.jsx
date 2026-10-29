import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Minus, Package, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { SmartImage } from '../ui';
import { formatMXN, PACKAGING, useStore } from '../../context/StoreContext';
import { MOLIENDAS } from '../../data/products';

const PACK_ICONS = { estandar: Package, delicado: ShieldCheck, regalo: Gift };

export default function CartStep({ onNext }) {
  const { lines, updateQty, removeLine, packaging, setPackaging } = useStore();

  if (!lines.length) {
    return (
      <div className="card mx-auto grid max-w-lg place-items-center gap-4 p-12 text-center">
        <span className="text-6xl">🛍️</span>
        <h2 className="text-xl font-bold text-navy-900">Tu carrito está vacío</h2>
        <p className="text-slate-500">Explora maquillaje premium, ropa deportiva y café de especialidad.</p>
        <Link to="/catalogo" className="btn-gold">Ir a la tienda <ArrowRight className="size-4" /></Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="card divide-y divide-slate-100" aria-label="Artículos en el carrito">
          {lines.map((l) => {
            const variantLabel = l.product.variants?.options.find((o) => o.value === l.variant)?.label;
            return (
              <article key={l.key} className="flex gap-4 p-4 animate-fade-in sm:p-5">
                <Link to={`/producto/${l.product.id}`} className="shrink-0">
                  <SmartImage src={l.product.images[0].replace('w=1000', 'w=240')} alt={l.product.name} className="size-24 rounded-xl object-cover" />
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{l.product.brand}</p>
                  <h3 className="font-semibold text-navy-900">{l.product.name}</h3>
                  <p className="text-xs text-slate-500">
                    {[variantLabel && `${l.product.variants.label}: ${variantLabel}`, l.extra && `Molienda: ${MOLIENDAS[l.extra]}`].filter(Boolean).join(' · ')}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center rounded-lg border border-slate-300" role="group" aria-label={`Cantidad de ${l.product.name}`}>
                      <button type="button" onClick={() => updateQty(l.key, l.qty - 1)} className="grid size-9 place-items-center hover:text-navy-900" aria-label="Disminuir"><Minus className="size-3.5" /></button>
                      <output className="w-7 text-center text-sm font-semibold">{l.qty}</output>
                      <button type="button" onClick={() => updateQty(l.key, l.qty + 1)} className="grid size-9 place-items-center hover:text-navy-900" aria-label="Aumentar"><Plus className="size-3.5" /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-navy-900">{formatMXN(l.total)}</p>
                        {l.qty > 1 && <p className="text-xs text-slate-400">{formatMXN(l.price)} c/u</p>}
                      </div>
                      <button type="button" onClick={() => removeLine(l.key)} className="rounded-lg p-2 text-slate-400 hover:bg-coral-500/10 hover:text-coral-500" aria-label={`Eliminar ${l.product.name}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <fieldset className="card p-5">
          <legend className="sr-only">Opciones de empaque</legend>
          <h2 className="mb-4 font-bold text-navy-900">Opciones de empaque</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(PACKAGING).map(([k, p]) => {
              const Icon = PACK_ICONS[k];
              return (
                <label key={k} className={`relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${packaging === k ? 'border-gold-500 bg-gold-100/40' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="packaging" value={k} checked={packaging === k} onChange={() => setPackaging(k)} className="sr-only" />
                  <Icon className={`size-6 ${packaging === k ? 'text-gold-700' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold text-navy-900">{p.label}</span>
                  <span className="text-xs text-slate-500">{p.desc}</span>
                  <span className="mt-auto text-sm font-bold text-navy-900">{p.price ? `+ ${formatMXN(p.price)}` : 'Incluido'}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <OrderSummary compact>
        <button type="button" onClick={onNext} className="btn-primary w-full py-3 text-base">
          Continuar al envío <ArrowRight className="size-4" />
        </button>
        <Link to="/catalogo" className="block text-center text-sm font-semibold text-navy-700 hover:text-gold-700">Seguir comprando</Link>
      </OrderSummary>
    </div>
  );
}
