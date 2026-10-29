import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Package, Search, ShoppingBag, Truck, User, X, UserPlus, LogIn } from 'lucide-react';
import { Logo, SmartImage } from './ui';
import { useStore, formatMXN } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthModal from './AuthModal';
import { CATEGORIES, PRODUCTS } from '../data/products';

const NAV = [
  { to: '/catalogo', label: 'Tienda' },
  { to: '/pedidos', label: 'Devoluciones y pedidos' },
  { to: '/rastreo', label: 'Rastrear' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/ayuda', label: 'Ayuda' },
];

export default function Navbar() {
  const { totals, orders } = useStore();
  const { currentUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [cat, setCat] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [showLiveResults, setShowLiveResults] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const searchContainerRef = useRef(null);

  // Cerrar el popup de búsqueda en vivo si se hace click fuera
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowLiveResults(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtrado reactivo en tiempo real al escribir
  const liveResults = q.trim()
    ? PRODUCTS.filter((p) => {
        if (cat && p.category !== cat) return false;
        const query = q.trim().toLowerCase();
        return `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(query);
      }).slice(0, 6)
    : [];

  // Pequeña animación del contador cuando cambia
  useEffect(() => {
    if (!totals.count) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [totals.count]);

  const submit = (e) => {
    e?.preventDefault();
    setShowLiveResults(false);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (cat) sp.set('categoria', cat);
    navigate(`/catalogo?${sp}`);
    setMobileOpen(false);
  };

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'text-gold-400' : 'text-slate-200 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/95 text-white shadow-lg backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      {/* Barra de anuncio */}
      <div className="hidden bg-gold-500 py-1 text-center text-xs font-semibold text-navy-950 sm:block">
        🚚 Envío gratis en compras desde $999 MXN · Rastreo GPS en tiempo real en todos los pedidos
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo light />

        {/* Buscador con selector de categoría y autocompletado en tiempo real */}
        <div ref={searchContainerRef} className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <form onSubmit={submit} role="search" className="flex items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-gold-500">
            <label className="relative">
              <span className="sr-only">Categoría</span>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-sm text-slate-200 outline-none [&>option]:text-navy-900">
                <option value="">Todas</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.short}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            </label>
            <span className="h-6 w-px bg-white/20" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowLiveResults(true);
              }}
              onFocus={() => setShowLiveResults(true)}
              placeholder="Buscar labiales, tenis, café de Chiapas…"
              aria-label="Buscar productos"
              className="h-10 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-slate-400 outline-none"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setShowLiveResults(false);
                }}
                className="px-2 text-slate-400 hover:text-white"
                aria-label="Borrar búsqueda"
              >
                <X className="size-4" />
              </button>
            )}
            <button type="submit" className="grid h-10 w-11 place-items-center bg-gold-500 text-navy-950 transition hover:bg-gold-400" aria-label="Buscar">
              <Search className="size-4.5" />
            </button>
          </form>

          {/* Menú flotante de resultados en vivo al presionar una tecla */}
          {showLiveResults && q.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 text-navy-900 shadow-2xl animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Productos sugeridos ({liveResults.length})</span>
                <span>Presiona Enter para ver todo</span>
              </div>
              {liveResults.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {liveResults.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/producto/${product.id}`}
                        onClick={() => setShowLiveResults(false)}
                        className="group flex items-center gap-3.5 rounded-xl p-2.5 transition hover:bg-slate-50"
                      >
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                          <SmartImage
                            src={product.images[0]}
                            alt={product.name}
                            className="size-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-700">
                            {product.brand} · {product.category}
                          </p>
                          <p className="truncate text-sm font-semibold text-navy-900 group-hover:text-gold-700">
                            {product.name}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-navy-900 shrink-0">
                          {formatMXN(product.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  No se encontraron productos que coincidan con “<strong>{q}</strong>”.
                </div>
              )}
              <div className="border-t border-slate-100 mt-1 pt-1.5 px-2">
                <button
                  type="button"
                  onClick={submit}
                  className="w-full text-center py-2 text-xs font-semibold text-navy-900 hover:text-gold-700 flex items-center justify-center gap-1"
                >
                  Ver todos los resultados para “{q}” <ChevronDown className="size-3.5 -rotate-90" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link to="/rastreo" className="hidden rounded-lg p-2.5 text-slate-200 transition hover:bg-white/10 hover:text-white lg:block" aria-label="Rastrear pedido" title="Rastrear pedido">
            <Truck className="size-5" />
          </Link>

          {/* Perfil de usuario (popover nativo) */}
          <button type="button" popoverTarget="user-menu" className="rounded-lg p-2.5 text-slate-200 transition hover:bg-white/10 hover:text-white" aria-label="Mi cuenta">
            <User className="size-5" />
          </button>
          <div id="user-menu" popover="auto" className="fixed left-auto right-4 top-20 m-0 w-72 rounded-2xl border border-slate-200 bg-white p-2 text-navy-900 shadow-2xl">
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 border-b border-slate-100 p-3">
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-bold text-navy-950 text-sm">
                    {currentUser.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{currentUser.nombre}</p>
                    <p className="text-xs text-slate-500">{currentUser.nivel} · {currentUser.puntos} pts</p>
                    <p className="truncate text-[11px] text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
                <ul className="py-1 text-sm">
                  <li>
                    <Link
                      to="/pedidos"
                      onClick={() => document.getElementById('user-menu')?.hidePopover?.()}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100 font-medium text-navy-900"
                    >
                      <Package className="size-4 text-gold-600" /> Devoluciones y pedidos ({orders.length})
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={orders[0] ? `/rastreo/${encodeURIComponent(orders[0].number)}` : '/rastreo'}
                      onClick={() => document.getElementById('user-menu')?.hidePopover?.()}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100"
                    >
                      <Truck className="size-4" /> Rastrear último pedido
                    </Link>
                  </li>
                  <li>
                    <Link to="/ayuda" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-100">
                      <User className="size-4" /> Centro de ayuda
                    </Link>
                  </li>
                  <li className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        toast({ title: 'Sesión cerrada', type: 'info' });
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-coral-500 hover:bg-slate-100"
                    >
                      <LogOut className="size-4" /> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className="p-3 text-center">
                <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-navy-100 text-navy-900">
                  <User className="size-5" />
                </div>
                <p className="text-sm font-bold text-navy-900">Accede a tu cuenta</p>
                <p className="text-xs text-slate-500 mb-3">Guarda tus pedidos y acumula puntos</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('user-menu')?.hidePopover?.();
                      setAuthMode('login');
                      setAuthModalOpen(true);
                    }}
                    className="btn-primary py-2 text-xs"
                  >
                    <LogIn className="size-3.5" /> Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById('user-menu')?.hidePopover?.();
                      setAuthMode('register');
                      setAuthModalOpen(true);
                    }}
                    className="btn-ghost py-2 text-xs"
                  >
                    <UserPlus className="size-3.5" /> Registrar nuevo usuario
                  </button>
                </div>
              </div>
            )}
            {currentUser && (
              <div className="border-t border-slate-100 px-3 py-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('user-menu')?.hidePopover?.();
                    setAuthMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-gold-700 hover:underline flex items-center justify-center gap-1 w-full"
                >
                  <UserPlus className="size-3" /> + Registrar otro usuario en vivo
                </button>
              </div>
            )}
          </div>

          <Link to="/checkout" className="relative rounded-lg p-2.5 text-slate-200 transition hover:bg-white/10 hover:text-white" aria-label={`Carrito, ${totals.count} artículos`}>
            <ShoppingBag className="size-5" />
            {totals.count > 0 && (
              <span className={`absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-navy-950 ring-2 ring-navy-900 transition-transform ${bump ? 'scale-125' : 'scale-100'}`}>
                {totals.count}
              </span>
            )}
          </Link>

          <button type="button" className="rounded-lg p-2.5 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen} aria-label="Menú">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Navegación secundaria desktop */}
      <nav aria-label="Principal" className="hidden border-t border-white/10 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:text-white">
              <span aria-hidden>{c.emoji}</span> {c.short}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-white/15" />
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={navClass}>
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 px-4 pb-4 md:hidden">
          <form onSubmit={submit} role="search" className="mt-3 flex overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos…" aria-label="Buscar productos" className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400" />
            <button className="grid w-12 place-items-center bg-gold-500 text-navy-950" aria-label="Buscar">
              <Search className="size-4.5" />
            </button>
          </form>
          <nav aria-label="Móvil" className="mt-3 grid gap-1" onClick={() => setMobileOpen(false)}>
            {CATEGORIES.map((c) => (
              <Link key={c.id} to={`/catalogo?categoria=${c.id}`} className="rounded-lg px-3 py-2.5 text-sm hover:bg-white/10">
                {c.emoji} {c.name}
              </Link>
            ))}
            <hr className="my-1 border-white/10" />
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Modal de Registro / Inicio de sesión en vivo */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
}
