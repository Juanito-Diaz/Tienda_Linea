import { Check } from 'lucide-react';

/** Stepper visual accesible del checkout. */
export default function Stepper({ steps, current, onStepClick }) {
  return (
    <nav aria-label="Progreso del pedido" className="no-print">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = done && onStepClick && current < steps.length - 1;
          return (
            <li key={s.label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(i)}
                aria-current={active ? 'step' : undefined}
                className="group flex flex-col items-center gap-2 disabled:cursor-default sm:flex-row"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold transition-all duration-300 ${
                    done ? 'bg-mint-500 text-white' : active ? 'bg-navy-900 text-gold-400 ring-4 ring-gold-500/30' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {done ? <Check className="size-5" /> : <s.icon className="size-5" />}
                </span>
                <span className="text-center sm:text-left">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Paso {i + 1}</span>
                  <span className={`block text-xs font-semibold sm:text-sm ${active ? 'text-navy-900' : done ? 'text-mint-500' : 'text-slate-500'}`}>{s.label}</span>
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className="mx-2 h-1 flex-1 overflow-hidden rounded-full bg-slate-200 sm:mx-4" aria-hidden>
                  <span className={`block h-full bg-mint-500 transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
