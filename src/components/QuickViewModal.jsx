import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { GamaBadge, SmartImage, Stars } from './ui';
import ProductBuyBox from './ProductBuyBox';
import { categoryById, getProduct } from '../data/products';

/**
 * Modal de vista rápida optimizado para máxima compatibilidad móvil (Android Chrome, iOS Safari y escritorio).
 * Utiliza un overlay puro de React sin depender de <dialog showModal()> ni de backdrop-filter,
 * eliminando por completo los bloqueos de renderizado y pantallas en blanco en navegadores Chromium móviles.
 */
export default function QuickViewModal({ productId, onClose }) {
  const product = productId ? getProduct(productId) : null;
  const [active, setActive] = useState(0);

  // Reiniciar miniatura activa al cambiar de producto
  useEffect(() => {
    setActive(0);
  }, [productId]);

  // Manejo de tecla Escape y bloqueo seguro de scroll de fondo
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [product, onClose]);

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

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qv-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in text-navy-900"
    >
      {/* Fondo oscuro con opacidad sólida */}
      <div
        className="fixed inset-0 bg-navy-950/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del contenido */}
      <div
        className="relative z-10 m-auto w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white text-navy-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="relative bg-slate-100 min-h-[260px]">
            <SmartImage
              src={currentImg}
              alt={product.name}
              emoji={cat.emoji}
              className="aspect-square size-full object-cover md:aspect-auto md:h-full"
            />
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                    aria-pressed={i === active}
                    className={`h-2.5 rounded-full transition-all ${
                      i === active ? 'w-7 bg-gold-500' : 'w-2.5 bg-white/90 shadow-xs'
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
              onAdded={onClose}
            />
            <Link
              to={`/producto/${product.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700"
            >
              Ver ficha completa <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
