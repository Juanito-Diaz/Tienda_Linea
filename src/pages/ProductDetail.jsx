import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Leaf, PackageCheck, RotateCcw, Truck } from 'lucide-react';
import ProductBuyBox from '../components/ProductBuyBox';
import ProductCard from '../components/ProductCard';
import { GamaBadge, SmartImage, Stars } from '../components/ui';
import { PRODUCTS, categoryById, getProduct } from '../data/products';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProduct(id);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [tab, setTab] = useState('detalles');

  if (!product) return <NotFound />;
  const cat = categoryById(product.category);
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const detailsTitle = product.category === 'maquillaje' ? 'Ingredientes y origen' : product.category === 'cafe' ? 'Origen y perfil' : 'Materiales y tecnología';

  const TABS = {
    detalles: detailsTitle,
    envio: 'Envío y manejo',
    devoluciones: 'Devoluciones',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Ruta de navegación" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-navy-900">Inicio</Link>
        <ChevronRight className="size-4" />
        <Link to={`/catalogo?categoria=${cat.id}`} className="hover:text-navy-900">{cat.name}</Link>
        <ChevronRight className="size-4" />
        <span aria-current="page" className="text-navy-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galería con zoom */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col" role="group" aria-label="Miniaturas">
            {product.images.map((src, i) => (
              <button key={src} type="button" onClick={() => setActive(i)} aria-label={`Imagen ${i + 1}`} aria-pressed={i === active} className={`size-20 overflow-hidden rounded-xl ring-2 transition ${i === active ? 'ring-gold-500' : 'ring-transparent opacity-70 hover:opacity-100'}`}>
                <SmartImage src={src.replace('w=1000', 'w=200')} alt="" emoji={cat.emoji} className="size-full object-cover" />
              </button>
            ))}
          </div>
          <div
            className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-slate-100"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <SmartImage
              key={active}
              src={product.images[active].replace('w=1000', 'w=1600')}
              alt={product.name}
              emoji={cat.emoji}
              loading="eager"
              className="size-full animate-fade-in object-cover transition-transform duration-200"
              style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
            {product.oldPrice && <span className="absolute left-4 top-4 rounded-full bg-coral-500 px-3 py-1 text-xs font-bold text-white">Oferta</span>}
          </div>
        </div>

        {/* Información */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-700">{cat.emoji} {cat.name}</span>
            <GamaBadge gama={product.gama} />
            {product.genero && <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-sky-700">{product.genero}</span>}
            {product.tueste && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">Tueste {product.tueste}</span>}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{product.brand}</p>
            <h1 className="font-display text-3xl font-bold text-navy-900 md:text-4xl">{product.name}</h1>
            <div className="mt-2"><Stars rating={product.rating} reviews={product.reviews} size="md" /></div>
          </div>
          <p className="leading-relaxed text-slate-600">{product.description}</p>
          <ProductBuyBox product={product} />
        </div>
      </div>

      {/* Pestañas de información */}
      <section className="mt-14">
        <div role="tablist" aria-label="Información del producto" className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {Object.entries(TABS).map(([k, label]) => (
            <button key={k} role="tab" id={`tab-${k}`} aria-selected={tab === k} aria-controls={`panel-${k}`} onClick={() => setTab(k)} className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === k ? 'border-gold-500 text-navy-900' : 'border-transparent text-slate-500 hover:text-navy-900'}`}>
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="card mt-6 animate-fade-in p-6">
          {tab === 'detalles' && (
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {product.details.map(([k, v]) => (
                <div key={k} className="border-b border-slate-100 pb-3">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Leaf className="size-3.5 text-gold-600" />{k}</dt>
                  <dd className="mt-1 text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 'envio' && (
            <ul className="space-y-3 text-slate-600">
              <li className="flex gap-3"><Truck className="size-5 shrink-0 text-navy-500" /> Sale del 5 a Logística Hub en menos de 12 h hábiles. Entrega en 24 h en CDMX y 2–4 días en el resto del país.</li>
              <li className="flex gap-3"><PackageCheck className="size-5 shrink-0 text-navy-500" /> {product.category === 'maquillaje' ? 'Empaque térmico opaco para proteger fórmulas sensibles a luz y calor.' : product.category === 'cafe' ? 'Bolsa con válvula desgasificadora; tostado máximo 72 h antes del envío.' : 'Empaque reciclado; calzado en caja original protegida.'}</li>
            </ul>
          )}
          {tab === 'devoluciones' && (
            <p className="flex gap-3 text-slate-600"><RotateCcw className="size-5 shrink-0 text-navy-500" /> 30 días para cambios o devoluciones. Cosméticos y café únicamente con sello intacto. Recolección gratuita a domicilio.</p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="rel-title">
          <h2 id="rel-title" className="section-title mb-6">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
