import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { GamaBadge, SmartImage, Stars } from './ui';
import ProductBuyBox from './ProductBuyBox';
import { categoryById, getProduct } from '../data/products';

/**
 * Vista rápida en un <dialog> nativo abierto con showModal():
 * el navegador aporta foco contenido, página inert, Esc y retorno de foco.
 */
export default function QuickViewModal({ productId, onClose }) {
  const ref = useRef(null);
  const product = productId ? getProduct(productId) : null;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (product && !dlg.open) {
      setActive(0);
      dlg.showModal();
    } else if (!product && dlg.open) {
      dlg.close();
    }
  }, [product]);

  // Fallback de "light dismiss" para navegadores sin soporte de closedby (Safari)
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg || 'closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e) => {
      const r = dlg.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    const down = (e) => (pressedOutside = outside(e));
    const up = (e) => pressedOutside && outside(e) && dlg.close();
    dlg.addEventListener('pointerdown', down);
    dlg.addEventListener('pointerup', up);
    return () => {
      dlg.removeEventListener('pointerdown', down);
      dlg.removeEventListener('pointerup', up);
    };
  }, []);

  const cat = product && categoryById(product.category);

  return (
    <dialog
      ref={ref}
      closedby="any"
      onClose={onClose}
      aria-labelledby="qv-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl"
    >
      {product && (
        <div className="grid md:grid-cols-2">
          <div className="relative bg-slate-100">
            <SmartImage src={product.images[active]} alt={product.name} emoji={cat.emoji} className="aspect-square size-full object-cover md:aspect-auto md:h-full" />
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === active}
                  className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-gold-500' : 'w-2 bg-white/80'}`}
                />
              ))}
            </div>
          </div>
          <div className="relative space-y-4 p-6 md:p-8">
            <form method="dialog" className="absolute right-4 top-4">
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label="Cerrar vista rápida">
                <X className="size-5" />
              </button>
            </form>
            <div className="flex items-center gap-2 pr-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">{cat.emoji} {cat.short}</span>
              <GamaBadge gama={product.gama} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{product.brand}</p>
              <h2 id="qv-title" className="font-display text-2xl font-bold text-navy-900">{product.name}</h2>
              <div className="mt-1"><Stars rating={product.rating} reviews={product.reviews} /></div>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
            <ProductBuyBox product={product} onAdded={() => ref.current?.close()} />
            <Link to={`/producto/${product.id}`} onClick={() => ref.current?.close()} className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700">
              Ver ficha completa <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </dialog>
  );
}
