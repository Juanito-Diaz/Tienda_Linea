import { forwardRef, useState } from 'react';
import { TriangleAlert, X, Send, CircleCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MOTIVOS = [
  'Demora excesiva en el tiempo estimado (ETA)',
  'La dirección registrada tiene un error',
  'El repartidor reporta que no encuentra el domicilio',
  'Empaque dañado durante el trayecto',
  'Cambio urgente de instrucciones de entrega',
  'Otro motivo',
];

const IncidentDialog = forwardRef(function IncidentDialog({ orderNumber }, ref) {
  const toast = useToast();
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [comentarios, setComentarios] = useState('');
  const [contacto, setContacto] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    toast({
      title: 'Incidencia reportada',
      description: `Folio #INC-${Math.floor(1000 + Math.random() * 9000)} generado para orden ${orderNumber}`,
      type: 'info',
    });
    setTimeout(() => {
      setSent(false);
      setComentarios('');
      setContacto('');
      ref.current?.close();
    }, 2000);
  };

  return (
    <dialog
      ref={ref}
      closedby="any"
      aria-labelledby="incident-title"
      className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-3xl bg-white p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-coral-500/10 text-coral-500">
            <TriangleAlert className="size-5" />
          </span>
          <div>
            <h2 id="incident-title" className="text-lg font-bold text-navy-900">
              Reportar Incidencia
            </h2>
            <p className="text-xs text-slate-500">Orden {orderNumber}</p>
          </div>
        </div>
        <form method="dialog">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-navy-900" aria-label="Cerrar modal">
            <X className="size-5" />
          </button>
        </form>
      </div>

      {sent ? (
        <div className="py-8 text-center animate-fade-in">
          <CircleCheck className="mx-auto size-14 text-mint-500" />
          <h3 className="mt-3 font-display text-xl font-bold text-navy-900">¡Reporte Enviado con Éxito!</h3>
          <p className="mt-1 text-sm text-slate-600">
            Nuestro equipo de logística y la central de monitoreo ya están atendiendo tu caso.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="label">Tipo de eventualidad</span>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="input cursor-pointer"
              required
            >
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="label">Detalles de la incidencia</span>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              placeholder="Indica cualquier instrucción o referencia para ayudar al repartidor..."
              className="input resize-none"
              required
            />
          </label>

          <label className="block">
            <span className="label">Teléfono o WhatsApp de contacto directo</span>
            <input
              type="tel"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Ej. 55 1234 5678"
              className="input"
              required
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="btn-ghost flex-1"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 bg-coral-500 hover:bg-coral-600">
              <Send className="size-4" /> Enviar reporte urgente
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
});

export default IncidentDialog;
