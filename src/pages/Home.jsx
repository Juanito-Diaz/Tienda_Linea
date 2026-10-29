import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Pause, Play, ShieldCheck, Thermometer, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SmartImage } from '../components/ui';
import { CATEGORIES, PRODUCTS, SLIDES } from '../data/products';

function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n) => setI((n + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section aria-roledescription="carrusel" aria-label="Novedades y promociones" className="relative h-[30rem] overflow-hidden bg-navy-950 md:h-[34rem]">
      {SLIDES.map((s, idx) => (
        <div
          key={s.id}
          aria-hidden={idx !== i}
          inert={idx !== i}
          className={`slide absolute inset-0 ${idx === i ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
        >
          <SmartImage src={s.image} alt="" className="size-full object-cover" fetchPriority={idx === 0 ? 'high' : 'auto'} loading={idx === 0 ? 'eager' : 'lazy'} />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/75 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-4">
            <div className={`max-w-xl space-y-5 text-white ${idx === i ? 'animate-fade-up' : ''}`}>
              <span className="inline-block rounded-full border border-gold-500/50 bg-gold-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-300">{s.kicker}</span>
              <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">{s.title}</h1>
              <p className="text-lg text-slate-300">{s.text}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={s.cta.to} className="btn-gold px-6 py-3 text-base">
                  {s.cta.label} <ArrowRight className="size-5" />
                </Link>
                <Link to="/rastreo" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
                  <Truck className="size-5" /> Rastrear pedido
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-7xl items-center gap-3 px-4">
        <div className="flex gap-2">
          {SLIDES.map((s, idx) => (
            <button key={s.id} type="button" onClick={() => go(idx)} aria-label={`Ir a la diapositiva ${idx + 1}`} aria-current={idx === i} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-10 bg-gold-500' : 'w-5 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setPaused((p) => !p)} className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20" aria-label={paused ? 'Reanudar carrusel' : 'Pausar carrusel'}>
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <button type="button" onClick={() => go(i - 1)} className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20" aria-label="Anterior">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => go(i + 1)} className="grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20" aria-label="Siguiente">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const promos = [
    PRODUCTS.find((p) => p.id === 'mq-001'),
    PRODUCTS.find((p) => p.id === 'dp-010'),
    PRODUCTS.find((p) => p.id === 'dp-001'),
    PRODUCTS.find((p) => p.id === 'cf-007'),
  ].filter(Boolean);
  const nuevos = PRODUCTS.filter((p) => p.tags.includes('nuevo')).slice(0, 8);

  return (
    <>
      <HeroSlider />

      {/* Propuesta de valor logística */}
      <section className="relative z-10 mx-auto mt-8 sm:mt-12 max-w-7xl px-4">
        <ul className="card grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {[
            [Truck, 'Entrega en 24 h', 'CDMX y zona metropolitana'],
            [MapPin, 'GPS en tiempo real', 'Sigue tu camioneta en el mapa'],
            [Thermometer, 'Cadena controlada', 'Cosméticos y café protegidos'],
            [ShieldCheck, '100% originales', 'Distribuidores oficiales'],
          ].map(([Icon, t, d]) => (
            <li key={t} className="flex items-center gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-700">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="font-semibold text-navy-900">{t}</p>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Accesos por categoría */}
      <section className="mx-auto max-w-7xl px-4 pt-20" aria-labelledby="cat-title">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">Tres mundos, una logística</p>
            <h2 id="cat-title" className="section-title">Compra por categoría</h2>
          </div>
          <Link to="/catalogo" className="hidden items-center gap-1 text-sm font-semibold text-navy-700 hover:text-gold-700 sm:inline-flex">
            Ver todo <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c, idx) => (
            <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="group relative h-80 overflow-hidden rounded-3xl animate-fade-up" style={{ animationDelay: `${idx * 90}ms` }}>
              <SmartImage src={c.image} alt="" emoji={c.emoji} className="size-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="text-3xl" aria-hidden>{c.emoji}</span>
                <h3 className="mt-2 font-display text-2xl font-bold">{c.name}</h3>
                <p className="text-sm text-slate-300">{c.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-400 transition group-hover:gap-2">
                  Explorar <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Promociones */}
      <section className="mx-auto max-w-7xl px-4 pt-20" aria-labelledby="promo-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-coral-500">Ofertas de la semana</p>
            <h2 id="promo-title" className="section-title">Promociones destacadas</h2>
          </div>
          <Link to="/catalogo?promo=1" className="btn-ghost">Ver todas las ofertas</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {promos.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Novedades */}
      <section className="mx-auto max-w-7xl px-4 pt-20" aria-labelledby="new-title">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">Recién llegados</p>
          <h2 id="new-title" className="section-title">Novedades</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {nuevos.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </>
  );
}
