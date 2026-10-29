import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="font-display text-8xl font-bold text-navy-900">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold text-navy-900 md:text-3xl">Página no encontrada</h1>
      <p className="mt-2 text-slate-500">
        La ruta que buscas no existe o ha sido reubicada dentro del sistema logístico.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">
          <Home className="size-4" /> Ir al inicio
        </Link>
        <Link to="/catalogo" className="btn-ghost">
          <ArrowLeft className="size-4" /> Ver tienda
        </Link>
      </div>
    </div>
  );
}
