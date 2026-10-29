import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Logo, SocialIcon } from './ui';

export default function Footer() {
  return (
    <footer className="mt-20 bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed text-slate-400">
            Plataforma multirrubro de comercio y distribución. Llevamos belleza premium, ropa deportiva técnica y café de especialidad hasta tu puerta con trazabilidad total.
          </p>
          <div className="flex gap-2">
            {[
              ['instagram', 'Instagram', 'https://instagram.com'],
              ['facebook', 'Facebook', 'https://facebook.com'],
              ['tiktok', 'TikTok', 'https://tiktok.com'],
              ['youtube', 'YouTube', 'https://youtube.com'],
            ].map(([icon, label, href]) => (
              <a key={icon} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:bg-gold-500 hover:text-navy-950">
                <SocialIcon name={icon} />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Tienda">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">Tienda</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" to="/catalogo?categoria=maquillaje">Maquillaje y Belleza</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?categoria=deportiva">Ropa Deportiva</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?categoria=cafe">Café de Especialidad</Link></li>
            <li><Link className="hover:text-white" to="/rastreo">Rastrear mi pedido</Link></li>
            <li><Link className="hover:text-white" to="/nosotros">Sobre 5 a Logística</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">Atención al cliente</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-gold-500" /> Lun–Vie 8:00–20:00<br />Sáb 9:00–15:00 (hora CDMX)</li>
            <li className="flex gap-2.5"><Phone className="size-4 shrink-0 text-gold-500" /> <a href="tel:+528005252564" className="hover:text-white">800 525 2564</a></li>
            <li className="flex gap-2.5"><Mail className="size-4 shrink-0 text-gold-500" /> <a href="mailto:soporte@5alogistica.mx" className="hover:text-white">soporte@5alogistica.mx</a></li>
            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" /> 5 a Logística Hub · Industrial Vallejo, CDMX</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">Legal</h2>
          <ul className="space-y-2.5 text-sm">
            <li><Link className="hover:text-white" to="/ayuda#privacidad">Aviso de privacidad</Link></li>
            <li><Link className="hover:text-white" to="/ayuda#faq">Políticas de devolución</Link></li>
            <li><Link className="hover:text-white" to="/nosotros#delicados">Manejo de productos delicados</Link></li>
            <li><Link className="hover:text-white" to="/ayuda">Términos y condiciones</Link></li>
          </ul>
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 p-3 text-xs ring-1 ring-white/10">
            <ShieldCheck className="size-5 shrink-0 text-mint-500" /> Pagos cifrados SSL · Productos 100% originales
          </p>
        </div>
      </div>
      <div id="privacidad" className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} 5 a Logística S.A. de C.V. Todos los derechos reservados.</p>
          <p>Tus datos personales se tratan conforme a la LFPDPPP. Consulta nuestro aviso de privacidad integral.</p>
        </div>
      </div>
    </footer>
  );
}
