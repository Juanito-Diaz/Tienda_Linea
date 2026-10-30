import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Tienda en línea, inicio">
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-950 text-gold-400 shadow-lg ring-1 ring-gold-500/40 transition group-hover:rotate-[-4deg]">
        <ShoppingBag className="size-5" />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-lg font-bold ${light ? 'text-white' : 'text-navy-900'}`}>Tienda en línea</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.2em] ${light ? 'text-gold-300' : 'text-gold-600'}`}>
          Belleza · Sport · Café
        </span>
      </span>
    </Link>
  );
}

/** Imagen con carga diferida y fallback elegante si la red falla. */
export function SmartImage({ src, alt, className = '', emoji = '📦', ...rest }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-navy-100 to-gold-100 text-5xl select-none ${className}`}>
        {emoji}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} {...rest} />;
}

export function Stars({ rating, reviews, size = 'sm' }) {
  const s = size === 'sm' ? 'size-3.5' : 'size-4.5';
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'fill-gold-500 text-gold-500' : 'text-slate-300'}`} />
        ))}
      </span>
      <span className="sr-only">{rating} de 5 estrellas</span>
      <span className="font-semibold text-navy-900">{rating}</span>
      {reviews != null && <span>({reviews})</span>}
    </span>
  );
}

export function GamaBadge({ gama, className = '' }) {
  if (!gama) return null;
  return gama === 'alta' ? (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full bg-navy-950 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300 shadow-sm ring-1 ring-gold-500/30 ${className}`}>
      Gama Alta
    </span>
  ) : (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 shadow-sm ring-1 ring-white/10 ${className}`}>
      Gama Media
    </span>
  );
}

/** Selector de variantes: color (swatches), talla y peso (chips). */
export function VariantSelector({ variants, value, onChange }) {
  if (!variants) return null;
  const current = variants.options.find((o) => o.value === value);
  return (
    <fieldset>
      <legend className="label">
        {variants.label}: <span className="normal-case tracking-normal text-navy-900">{current?.label}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {variants.options.map((o) =>
          variants.type === 'color' && o.hex ? (
            <label key={o.value} className="cursor-pointer" title={o.label}>
              <input type="radio" name={variants.label} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
              <span
                className="block size-9 rounded-full border-2 border-white shadow ring-2 ring-slate-200 transition peer-checked:ring-gold-500 peer-focus-visible:ring-navy-500 hover:scale-110"
                style={{ background: o.hex }}
              />
              <span className="sr-only">{o.label}</span>
            </label>
          ) : (
            <label key={o.value} className="cursor-pointer">
              <input type="radio" name={variants.label} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
              <span className="block min-w-12 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-medium transition peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500 hover:border-navy-900">
                {o.label}
              </span>
            </label>
          )
        )}
      </div>
    </fieldset>
  );
}

export function SocialIcon({ name, className = 'size-5' }) {
  const paths = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
      </>
    ),
    facebook: <path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H16l.6-4h-3.1V9c0-.6.4-1 1-1Z" />,
    tiktok: <path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.5a6 6 0 1 0 5.1 5.9V9.1a7.6 7.6 0 0 0 4.4 1.4V7.2a4.3 4.3 0 0 1-3.3-1.4Z" />,
    whatsapp: (
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"
      />
    ),
    youtube: <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {paths[name]}
    </svg>
  );
}

export const SUPPORT_WHATSAPP = 'https://wa.me/525512345678?text=' + encodeURIComponent('Hola 5 a Logística, necesito ayuda con mi pedido');
