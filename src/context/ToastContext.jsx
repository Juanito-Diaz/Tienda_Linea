import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CircleCheck className="size-5 text-mint-500" aria-hidden />,
  info: <Info className="size-5 text-navy-400" aria-hidden />,
  error: <TriangleAlert className="size-5 text-coral-500" aria-hidden />,
};

/**
 * Notificaciones tipo toast.
 * Se renderizan dentro de un contenedor con popover="manual": vive en el top layer
 * (aparece incluso sobre un <dialog> modal abierto) y no se cierra por "light dismiss".
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const regionRef = useRef(null);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, type = 'success', image, duration = 3500 }) => {
      const id = crypto.randomUUID();
      setToasts((t) => [...t.slice(-3), { id, title, description, type, image }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss]
  );

  // Muestra / oculta el popover según haya toasts. Se vuelve a mostrar en cada nuevo toast
  // para que quede por encima de cualquier <dialog> abierto después.
  useLayoutEffect(() => {
    const el = regionRef.current;
    if (!el || !('showPopover' in el)) return;
    if (toasts.length) {
      if (el.matches(':popover-open')) el.hidePopover();
      el.showPopover();
    } else if (el.matches(':popover-open')) {
      el.hidePopover();
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <section
        ref={regionRef}
        popover="manual"
        className="toast-region"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-2xl shadow-navy-900/20 backdrop-blur"
          >
            {t.image ? (
              <img src={t.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="mt-0.5">{ICONS[t.type]}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                {t.image && ICONS[t.type]}
                {t.title}
              </p>
              {t.description && <p className="mt-0.5 truncate text-xs text-slate-500">{t.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900"
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </section>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
