import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CircleCheck className="size-5 text-mint-500" aria-hidden />,
  info: <Info className="size-5 text-navy-400" aria-hidden />,
  error: <TriangleAlert className="size-5 text-coral-500" aria-hidden />,
};

/**
 * Notificaciones tipo toast en React estándar.
 * Totalmente seguro contra fallas de contexto seguro (HTTP/HTTPS) y sin dependencias de la API de Popover.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback(
    ({ title, description, type = 'success', image, duration = 3500 }) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((t) => [...t.slice(-3), { id, title, description, type, image }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <section
          className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 pointer-events-none max-w-[calc(100vw-2.5rem)] w-88"
          aria-live="polite"
          aria-label="Notificaciones"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className="toast pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl shadow-navy-900/20 animate-fade-up"
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
                {t.description && (
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-900 cursor-pointer"
                aria-label="Cerrar notificación"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </section>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
