import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag } from 'lucide-react';
import { GamaBadge, SmartImage, Stars } from './ui';
import { formatMXN, useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useQuickView } from '../context/QuickViewContext';
import { categoryById } from '../data/products';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useStore();
  const toast = useToast();
  const openQuick = useQuickView();
  const [added, setAdded] = useState(false);
  const cat = categoryById(product.category);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  const quickAdd = () => {
    const variant = product.variants?.options[0]?.value;
    const extra = product.molienda?.[0];
    addToCart(product.id, variant, 1, extra);
    toast({ title: 'Añadido al carrito', description: `${product.name} · ${product.variants?.options[0]?.label ?? ''}`, image: product.images[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        <Link to={`/producto/${product.id}`} aria-label={`Ver producto ${product.name}`}>
          <SmartImage src={product.images[0]} alt="" emoji={cat.emoji} className="size-full object-cover transition duration-700 group-hover:scale-105" />
        </Link>
        <div className="absolute left-3 top-3 z-10 pointer-events-none">
          {discount > 0 && <span className="rounded-full bg-coral-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">-{discount}%</span>}
        </div>
        <div className="absolute right-3 top-3 z-10 flex flex-wrap items-center justify-end gap-1.5 pointer-events-none">
          {product.tags.includes('nuevo') && (
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase text-navy-900 shadow-sm ring-1 ring-black/5">
              Nuevo
            </span>
          )}
          {product.gama && <GamaBadge gama={product.gama} />}
        </div>
        <button
          type="button"
          onClick={() => openQuick(product.id)}
          className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-navy-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 max-md:translate-y-0 max-md:opacity-100 z-10 cursor-pointer"
        >
          <Eye className="size-4" /> Vista rápida
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">{product.brand}</p>
        <h3 className="line-clamp-2 font-semibold text-sm leading-snug text-navy-900">
          <Link to={`/producto/${product.id}`} className="hover:text-gold-700">
            {product.name}
          </Link>
        </h3>
        <Stars rating={product.rating} reviews={product.reviews} />
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-lg font-bold text-navy-900">{formatMXN(product.price)}</p>
            {product.oldPrice && <p className="text-xs text-slate-400 line-through">{formatMXN(product.oldPrice)}</p>}
          </div>
          <button
            type="button"
            onClick={quickAdd}
            className={`grid size-11 place-items-center rounded-xl transition ${added ? 'bg-mint-500 text-white' : 'bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-950'}`}
            aria-label={`Añadir ${product.name} al carrito`}
          >
            <ShoppingBag className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
