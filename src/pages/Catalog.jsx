import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, MOLIENDAS, PRODUCTS } from '../data/products';

const PRICE_MAX = 3000;
const SORTS = {
  relevancia: 'Relevancia',
  'precio-asc': 'Precio: menor a mayor',
  'precio-desc': 'Precio: mayor a menor',
  rating: 'Mejor valorados',
};

function CheckGroup({ legend, name, options, selected, toggle }) {
  return (
    <fieldset className="space-y-2">
      <legend className="label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => {
          const on = selected.includes(value);
          return (
            <label key={value} className={`chip ${on ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-navy-900'}`}>
              <input type="checkbox" className="sr-only" name={name} checked={on} onChange={() => toggle(name, value)} />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const categoria = params.get('categoria') ?? '';
  const q = (params.get('q') ?? '').toLowerCase();
  const promo = params.get('promo') === '1';
  const list = (k) => params.getAll(k);
  const min = Number(params.get('min') ?? 0);
  const max = Number(params.get('max') ?? PRICE_MAX);
  const sort = params.get('orden') ?? 'relevancia';

  const update = (fn) => {
    const next = new URLSearchParams(params);
    fn(next);
    setParams(next, { replace: true });
  };
  const toggle = (k, v) =>
    update((n) => {
      const vals = n.getAll(k);
      n.delete(k);
      (vals.includes(v) ? vals.filter((x) => x !== v) : [...vals, v]).forEach((x) => n.append(k, x));
    });
  const setOne = (k, v) => update((n) => (v === '' || v == null ? n.delete(k) : n.set(k, v)));
  const setCategory = (c) =>
    update((n) => {
      ['gama', 'genero', 'talla', 'tueste', 'molienda'].forEach((k) => n.delete(k));
      c ? n.set('categoria', c) : n.delete('categoria');
    });

  const results = useMemo(() => {
    const gama = list('gama'), genero = list('genero'), talla = list('talla'), tueste = list('tueste'), molienda = list('molienda');
    let r = PRODUCTS.filter((p) => {
      if (categoria && p.category !== categoria) return false;
      if (promo && !p.oldPrice) return false;
      if (q && !`${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(q)) return false;
      if (p.price < min || p.price > max) return false;
      if (gama.length && !gama.includes(p.gama)) return false;
      if (genero.length && !genero.includes(p.genero)) return false;
      if (talla.length && !p.tallas?.some((t) => talla.includes(t))) return false;
      if (tueste.length && !tueste.includes(p.tueste)) return false;
      if (molienda.length && !p.molienda?.some((m) => molienda.includes(m))) return false;
      return true;
    });
    if (sort === 'precio-asc') r = [...r].sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') r = [...r].sort((a, b) => b.price - a.price);
    if (sort === 'rating') r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const cat = CATEGORIES.find((c) => c.id === categoria);
  const tallasDisponibles = [...new Set(PRODUCTS.filter((p) => p.category === 'deportiva').flatMap((p) => p.tallas))];
  const activeCount = ['gama', 'genero', 'talla', 'tueste', 'molienda'].reduce((s, k) => s + list(k).length, 0) + (params.has('min') || params.has('max') ? 1 : 0) + (promo ? 1 : 0);

  const filters = (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="label">Categoría</legend>
        {[['', 'Todas las categorías', '🛍️'], ...CATEGORIES.map((c) => [c.id, c.name, c.emoji])].map(([id, label, emoji]) => (
          <label key={id || 'all'} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${categoria === id ? 'bg-navy-900 font-semibold text-white' : 'hover:bg-slate-100'}`}>
            <input type="radio" name="categoria" className="sr-only" checked={categoria === id} onChange={() => setCategory(id)} />
            <span aria-hidden>{emoji}</span> {label}
            <span className={`ml-auto text-xs ${categoria === id ? 'text-gold-300' : 'text-slate-400'}`}>
              {id ? PRODUCTS.filter((p) => p.category === id).length : PRODUCTS.length}
            </span>
          </label>
        ))}
      </fieldset>

      {(categoria === 'maquillaje' || !categoria) && (
        <CheckGroup legend="Nivel de gama (maquillaje)" name="gama" options={[['media', 'Gama Media'], ['alta', 'Gama Alta']]} selected={list('gama')} toggle={toggle} />
      )}
      {(categoria === 'deportiva' || !categoria) && (
        <>
          <CheckGroup legend="Género (ropa)" name="genero" options={[['mujer', 'Mujer'], ['hombre', 'Hombre'], ['unisex', 'Unisex']]} selected={list('genero')} toggle={toggle} />
          <CheckGroup legend="Talla" name="talla" options={tallasDisponibles.map((t) => [t, t])} selected={list('talla')} toggle={toggle} />
        </>
      )}
      {(categoria === 'cafe' || !categoria) && (
        <>
          <CheckGroup legend="Tueste (café)" name="tueste" options={[['claro', 'Claro'], ['medio', 'Medio'], ['oscuro', 'Oscuro']]} selected={list('tueste')} toggle={toggle} />
          <CheckGroup legend="Molienda" name="molienda" options={Object.entries(MOLIENDAS)} selected={list('molienda')} toggle={toggle} />
        </>
      )}

      <fieldset className="space-y-3">
        <legend className="label">Rango de precio (MXN)</legend>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Precio mínimo</span>
            <input type="number" min={0} max={max} step={50} value={min} onChange={(e) => setOne('min', e.target.value)} className="input" />
          </label>
          <span className="text-slate-400">—</span>
          <label className="flex-1">
            <span className="sr-only">Precio máximo</span>
            <input type="number" min={min} max={PRICE_MAX} step={50} value={max} onChange={(e) => setOne('max', e.target.value)} className="input" />
          </label>
        </div>
        <input type="range" min={0} max={PRICE_MAX} step={50} value={max} onChange={(e) => setOne('max', e.target.value)} className="w-full accent-gold-500" aria-label="Precio máximo" />
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
        <input type="checkbox" checked={promo} onChange={() => setOne('promo', promo ? '' : '1')} className="size-4 accent-navy-900" />
        Solo productos en promoción
      </label>

      <button type="button" onClick={() => setParams(categoria ? { categoria } : {}, { replace: true })} className="btn-ghost w-full">
        <RotateCcw className="size-4" /> Limpiar filtros
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <nav aria-label="Ruta de navegación" className="mb-2 text-xs text-slate-500">Inicio / Tienda {cat && `/ ${cat.name}`}</nav>
        <h1 className="section-title">{cat ? cat.name : q ? `Resultados para “${params.get('q')}”` : 'Todos los productos'}</h1>
        {cat && <p className="mt-1 text-slate-500">{cat.tagline}</p>}
      </header>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto p-5">{filters}</div>
        </aside>

        <section aria-label="Resultados">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setShowFilters(true)} className="btn-ghost lg:hidden">
              <SlidersHorizontal className="size-4" /> Filtros {activeCount > 0 && <span className="rounded-full bg-gold-500 px-1.5 text-xs text-navy-950">{activeCount}</span>}
            </button>
            <p className="text-sm text-slate-500" aria-live="polite">
              <strong className="text-navy-900">{results.length}</strong> productos
            </p>
            {q && (
              <button type="button" onClick={() => setOne('q', '')} className="chip border-navy-200 bg-navy-50 text-navy-700">
                “{params.get('q')}” <X className="ml-1 size-3" />
              </button>
            )}
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-slate-500">Ordenar:</span>
              <select value={sort} onChange={(e) => setOne('orden', e.target.value)} className="input w-auto cursor-pointer py-2">
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>

          {results.length ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
              {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : (
            <div className="card grid place-items-center gap-3 p-16 text-center">
              <span className="text-5xl">🔍</span>
              <p className="font-semibold text-navy-900">No encontramos productos con esos filtros</p>
              <button type="button" onClick={() => setParams({}, { replace: true })} className="btn-primary">Ver todo el catálogo</button>
            </div>
          )}
        </section>
      </div>

      {/* Panel de filtros móvil */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 animate-fade-in bg-navy-950/60" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(22rem,90vw)] animate-fade-in overflow-y-auto overscroll-contain bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">Filtros</h2>
              <button type="button" onClick={() => setShowFilters(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>
            {filters}
            <button type="button" onClick={() => setShowFilters(false)} className="btn-primary mt-4 w-full">Ver {results.length} productos</button>
          </div>
        </div>
      )}
    </div>
  );
}
