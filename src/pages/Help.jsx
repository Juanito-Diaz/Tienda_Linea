import { useState } from 'react';
import { Mail, Phone, Clock, MessageSquare, Send, CircleCheck, HelpCircle, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { SUPPORT_WHATSAPP, SocialIcon } from '../components/ui';

const FAQS = [
  {
    q: '¿Cuáles son los tiempos y costos de entrega?',
    a: 'En la Ciudad de México y área conurbada contamos con entregas exprés en 24 horas hábiles. Para el resto de la República Mexicana el tiempo es de 2 a 4 días hábiles. El envío es completamente GRATIS en compras superiores a $699 MXN; de lo contrario tiene una tarifa fija de $119 MXN.',
  },
  {
    q: '¿Cómo garantizan la autenticidad de los cosméticos de Gama Media y Alta?',
    a: 'Adquirimos los lotes directamente de los distribuidores y laboratorios autorizados a nivel internacional. Cada producto incluye su número de lote registrado, holograma de seguridad y código QR escaneable que certifica su originalidad y caducidad.',
  },
  {
    q: '¿Cuál es la política de devoluciones y cambios?',
    a: 'Para ropa deportiva y calzado tienes 30 días naturales a partir de la entrega para solicitar cambio de talla o devolución sin costo alguno. En cosméticos y café, por motivos de higiene y salubridad, solo se aceptan devoluciones si el producto conserva intacto su sello de fábrica o si presentó algún daño durante el transporte.',
  },
  {
    q: '¿Cómo funciona el rastreo GPS en tiempo real?',
    a: 'Una vez asignado el repartidor a tu pedido, nuestra flota emite su posición satelital cada pocos segundos. En nuestra pantalla de Rastreo puedes ver la camioneta desplazándose por el mapa, la distancia restante y el tiempo estimado de llegada (ETA) dinámico.',
  },
  {
    q: '¿El café se envía en grano o molido?',
    a: 'Ofrecemos ambas opciones. Puedes seleccionar grano entero para molerlo en casa antes de infusionar, o solicitar molienda personalizada: fina (espresso), media (filtro/V60) o gruesa (prensa francesa). Tostamos semanalmente para garantizar máxima frescura.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express con opciones a 3 y 6 meses sin intereses), transferencias electrónicas SPEI y pago contra entrega (efectivo o terminal móvil al recibir tu paquete).',
  },
];

export default function Help() {
  const toast = useToast();
  const [ticketSent, setTicketSent] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    orden: '',
    motivo: 'Duda con mi pedido',
    mensaje: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicketSent(true);
    toast({
      title: 'Mensaje recibido',
      description: 'Un asesor se pondrá en contacto contigo en breve vía correo o WhatsApp.',
      type: 'success',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Encabezado */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block rounded-full bg-gold-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold-600 ring-1 ring-gold-500/30">
          Soporte y Atención
        </span>
        <h1 className="section-title mt-2">Centro de Ayuda y Contacto</h1>
        <p className="mt-2 text-slate-600">
          ¿Tienes dudas con un producto, necesitas reportar un problema o quieres conocer más de nuestras políticas? Estamos aquí para asistirte.
        </p>
      </div>

      {/* Canales Directos */}
      <section className="grid gap-6 sm:grid-cols-3 mb-16">
        <div className="card p-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-900 mb-3">
            <Phone className="size-6 text-gold-600" />
          </span>
          <h2 className="font-bold text-navy-900">Línea Telefónica</h2>
          <p className="text-xs text-slate-500 mt-1">Lunes a Viernes 8:00 a 20:00 hrs</p>
          <a href="tel:8005252564" className="mt-3 font-semibold text-navy-700 hover:text-gold-700">
            800 525 2564
          </a>
        </div>

        <div className="card p-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-mint-500/10 text-mint-600 mb-3">
            <SocialIcon name="whatsapp" className="size-6 text-[#25D366]" />
          </span>
          <h2 className="font-bold text-navy-900">WhatsApp de Soporte</h2>
          <p className="text-xs text-slate-500 mt-1">Atención rápida y seguimiento ágil</p>
          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="mt-3 font-semibold text-[#128C7E] hover:underline"
          >
            +52 55 1234 5678
          </a>
        </div>

        <div className="card p-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-navy-50 text-navy-900 mb-3">
            <Mail className="size-6 text-navy-600" />
          </span>
          <h2 className="font-bold text-navy-900">Correo Electrónico</h2>
          <p className="text-xs text-slate-500 mt-1">Respuesta garantizada en &lt; 24h</p>
          <a href="mailto:soporte@5alogistica.mx" className="mt-3 font-semibold text-navy-700 hover:text-gold-700">
            soporte@5alogistica.mx
          </a>
        </div>
      </section>

      {/* Grid: Preguntas Frecuentes y Formulario de Contacto */}
      <div className="grid gap-12 lg:grid-cols-2">
        {/* FAQ Colapsable con <details> nativo y name para comportamiento acordeón */}
        <section id="faq" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="size-6 text-gold-600" />
            <h2 className="font-display text-2xl font-bold text-navy-900">Preguntas Frecuentes (FAQ)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Respuestas inmediatas a las dudas más comunes sobre envíos, garantías y productos.
          </p>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                name="5a-faq-group"
                className="faq card group p-4 transition-all duration-200 open:border-gold-400 open:ring-2 open:ring-gold-500/10 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold text-navy-900">
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className="faq-icon size-5 text-slate-400 transition-transform duration-200 shrink-0" />
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 text-sm leading-relaxed text-slate-600">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Formulario de Contacto Directo */}
        <section className="card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-6 text-navy-900" />
            <h2 className="font-display text-2xl font-bold text-navy-900">Enviar Solicitud o Incidencia</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Completa este formulario si tienes un problema específico con un pedido o requieres atención especializada.
          </p>

          {ticketSent ? (
            <div className="py-12 text-center animate-fade-in space-y-3">
              <CircleCheck className="mx-auto size-16 text-mint-500" />
              <h3 className="font-display text-2xl font-bold text-navy-900">¡Mensaje Recibido!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Hemos generado el ticket de atención. Revisa tu bandeja de entrada en <strong>{form.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setTicketSent(false)}
                className="btn-ghost mt-4"
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Tu Nombre</span>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                    placeholder="Lily García"
                    className="input"
                  />
                </label>
                <label className="block">
                  <span className="label">Correo Electrónico</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="ejemplo@correo.com"
                    className="input"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Número de Orden (opcional)</span>
                  <input
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: e.target.value })}
                    placeholder="#5A-LOG-XXXXX"
                    className="input font-mono"
                  />
                </label>
                <label className="block">
                  <span className="label">Asunto / Motivo</span>
                  <select
                    value={form.motivo}
                    onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                    className="input cursor-pointer"
                  >
                    <option>Duda con mi pedido</option>
                    <option>Incidencia con la entrega / demora</option>
                    <option>Cambio de talla o devolución</option>
                    <option>Consulta de autenticidad de cosmético</option>
                    <option>Facturación electrónica</option>
                    <option>Otro</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="label">Mensaje detallado</span>
                <textarea
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                  rows={4}
                  placeholder="Explícanos tu situación con el mayor detalle posible..."
                  className="input resize-none"
                />
              </label>

              <button type="submit" className="btn-primary w-full py-3">
                <Send className="size-4" /> Enviar mensaje a soporte
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
