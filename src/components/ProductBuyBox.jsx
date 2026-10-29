import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { VariantSelector } from './ui';
import { formatMXN, unitPrice, useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { MOLIENDAS } from '../data/products';

/** Caja de compra reutilizable (ficha de producto y vista rápida). */
export default function ProductBuyBox({ product, onAdded }) {
  const { addToCart } = useStore();
  const toast = useToast();
  const [variant, setVariant] = useState(product.variants?.options[0]?.value);
  const [molienda, setMolienda] = useState(product.molienda?.[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setVariant(product.variants?.options[0]?.value);
    setMolienda(product.molienda?.[0]);
    setQty(1);
  }, [product]);

  const price = unitPrice(product, variant);
  const variantLabel = product.variants?.options.find((o) => o.value === variant)?.label;

  const add = () => {
    addToCart(product.id, variant, qty, molienda);
    toast({
      title: `Añadido al carrito (${qty})`,
      description: [product.name, variantLabel, molienda && MOLIENDAS[molienda]].filter(Boolean).join(' · '),
      image: product.images[0],
    });
    onAdded?.();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-navy-900">{formatMXN(price)}</p>
        {product.oldPrice && !product.variants?.options.find((o) => o.value === variant)?.priceDelta && (
          <p className="text-base text-slate-400 line-through">{formatMXN(product.oldPrice)}</p>
        )}
        <span className="text-xs text-slate-500">IVA incluido</span>
      </div>

      <VariantSelector variants={product.variants} value={variant} onChange={setVariant} />

      {product.molienda && (
        <label className="block">
          <span className="label">Molienda</span>
          <select value={molienda} onChange={(e) => setMolienda(e.target.value)} className="input cursor-pointer">
            {product.molienda.map((m) => (
              <option key={m} value={m}>
                {MOLIENDAS[m]}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border border-slate-300 bg-white" role="group" aria-label="Cantidad">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center text-slate-600 hover:text-navy-900" aria-label="Disminuir cantidad">
            <Minus className="size-4" />
          </button>
          <output className="w-8 text-center font-semibold" aria-live="polite">{qty}</output>
          <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} className="grid size-11 place-items-center text-slate-600 hover:text-navy-900" aria-label="Aumentar cantidad">
            <Plus className="size-4" />
          </button>
        </div>
        <button type="button" onClick={add} className="btn-gold h-11 flex-1 text-base">
          <ShoppingBag className="size-5" /> Añadir al carrito
        </button>
      </div>

      <ul className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <li className="flex items-center gap-2"><Truck className="size-4 text-navy-500" /> Entrega en 24 h en CDMX</li>
        <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-mint-500" /> Garantía de autenticidad</li>
      </ul>
    </div>
  );
}
