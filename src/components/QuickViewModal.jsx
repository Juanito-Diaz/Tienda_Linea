import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { GamaBadge, SmartImage, Stars } from './ui';
import ProductBuyBox from './ProductBuyBox';
import { categoryById, getProduct } from '../data/products';

/**
 * Vista rápida en un <dialog> nativo abierto con showModal():
 * Diseñado con manejo seguro de ciclo de vida para evitar DOMExceptions
 * en Android Chrome y navegadores móviles.
 */
export default function QuickViewModal({ productId, onClose }) {
  const ref = useRef(null);
  const product = productId ? getProduct(productId) : null;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;

    if (product) {
      setActive(0);
      if (!dlg.open) {
        try {
          dlg.showModal();
        } catch {
          // Si el diálogo ya estaba en transición o abierto, ignoramos el DOMException
        }
      }
    } else if (dlg.open) {
      try {
        dlg.close();
      } catch {
        // En caso de que ya se encuentre cerrado
      }
    }
  }, [product]);

  // Si no hay producto activo, no renderizamos el contenido
  if (!product) return null;

  const cat = categoryById(product.category) || {
    id: product.category,
    name: 'General',
    short: 'General',
    emoji: '🛍️',
  };

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [''];
  const currentImg = images[active] || images[0];

  const handleBackdropClick = (e) => {
    if (e.target === ref.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={ref}
      onClick={handleBackdropClick}
      onClose={onClose}
      aria-labelledby="qv-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-navy-950/60 backdrop:backdrop-blur-xs"
    >
      <div className="grid md:grid-cols-2">
        <div className="relative bg-slate-100">
          <SmartImage
            src={currentImg}
            alt={product.name}
            emoji={cat.emoji}
            className="aspect-square size-full object-cover md:aspect-auto md:h-full"
          />
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-pressed={i === active}
                  className={`h-2 rounded-full transition-all ${
                    i === active ? 'w-6 bg-gold-500' : 'w-2 bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="relative space-y-4 p-6 md:p-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900 focus:outline-hidden"
            aria-label="Cerrar vista rápida"
          >
            <X className="size-5" />
          </button>
          <div className="flex items-center gap-2 pr-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">
              {cat.emoji} {cat.short}
            </span>
            <GamaBadge gama={product.gama} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{product.brand}</p>
            <h2 id="qv-title" className="font-display text-2xl font-bold text-navy-900">
              {product.name}
            </h2>
            <div className="mt-1">
              <Stars rating={product.rating} reviews={product.reviews} />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
          <ProductBuyBox
            product={product}
            onAdded={() => {
              try {
                ref.current?.close();
              } catch {
                // Ignore
              }
              onClose();
            }}
          />
          <Link
            to={`/producto/${product.id}`}
            onClick={() => {
              try {
                ref.current?.close();
              } catch {
                // Ignore
              }
              onClose();
            }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700"
          >
            Ver ficha completa <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </dialog>
  );
}
