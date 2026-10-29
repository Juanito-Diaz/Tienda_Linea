import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Sparkles, Thermometer, Box, Award, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-8 text-white md:p-16">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-400 ring-1 ring-gold-500/30">
            Sobre Nosotros
          </span>
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            La logística detrás de tus marcas y pasiones favoritas
          </h1>
          <p className="text-base text-slate-300 md:text-lg">
            En <strong>5 a Logística</strong> unimos la curaduría de productos selectos de alta exigencia con una infraestructura de entrega de última milla trazable, segura y veloz.
          </p>
        </div>
        <div className="absolute -bottom-12 -right-12 size-80 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      </section>

      {/* Misión y Visión */}
      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="card space-y-4 p-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-900">
            <Award className="size-6 text-gold-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Nuestra Misión</h2>
          <p className="leading-relaxed text-slate-600">
            Transformar la experiencia de compra en línea multirrubro garantizando que cosméticos de lujo, indumentaria deportiva de alto rendimiento y café de especialidad lleguen a manos de nuestros clientes en condiciones idénticas a las de su origen, con total transparencia en tiempo real.
          </p>
        </div>

        <div className="card space-y-4 p-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-900">
            <Truck className="size-6 text-navy-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Red de Distribución</h2>
          <p className="leading-relaxed text-slate-600">
            Operamos desde nuestro nodo central <strong>5 a Logística Hub</strong> en la zona industrial de Vallejo (CDMX), con hubs satélites en Guadalajara y Monterrey. Nuestra flota propia de vehículos eléctricos y de bajas emisiones cuenta con telemetría GPS y control dinámico de ruta.
          </p>
        </div>
      </section>

      {/* Manejo de Productos Delicados */}
      <section id="delicados" className="mt-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">Protocolos Especializados</p>
          <h2 className="section-title">Políticas de Manejo de Productos Delicados</h2>
          <p className="mt-2 text-slate-500">
            Cada una de nuestras tres divisiones requiere cuidados técnicos y ambientales rigurosos.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <Sparkles className="size-5" />
              <h3 className="font-bold text-navy-900">1. Cosméticos y Cuidado Facial</h3>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Transporte en contenedores isotérmicos (18°C a 22°C) protegiendo sueros, activos y vitaminas sensibles a la luz.</li>
              <li>Sellado al vacío con protección multicapa contra impactos y derrames.</li>
              <li>Inspección de lote y autenticidad certificada en bodega.</li>
            </ul>
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2 text-sky-600">
              <Box className="size-5" />
              <h3 className="font-bold text-navy-900">2. Ropa Deportiva y Calzado</h3>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Empaque antihumedad con gel de sílice para preservar tejidos técnicos impermeables y fibras elásticas.</li>
              <li>Cajas reforzadas de calzado con estructura perimetral indeformable.</li>
              <li>Garantía de cambio de talla fácil con recolección directa en puerta.</li>
            </ul>
          </div>

          <div className="card p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Thermometer className="size-5" />
              <h3 className="font-bold text-navy-900">3. Café de Especialidad</h3>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Envío inmediato post-tueste con un desfase máximo de 72 horas para garantizar frescura óptima.</li>
              <li>Bolsas con válvula desgasificadora unidireccional y barrera de aluminio contra oxígeno y olores externos.</li>
              <li>Protección acolchada extra en accesorios frágiles como goteros cerámicos y servidores de vidrio.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="mt-16 card bg-navy-50 border-navy-100 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-bold text-navy-900 md:text-3xl">¿Listo para estrenar o degustar?</h2>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto">
          Explora nuestro catálogo seleccionado y comprueba la precisión de nuestro seguimiento GPS.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/catalogo" className="btn-primary">
            Explorar catálogo completo <ArrowRight className="size-4" />
          </Link>
          <Link to="/rastreo" className="btn-ghost">
            Ver simulador de rastreo
          </Link>
        </div>
      </section>
    </div>
  );
}
