import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CreditCard, HandCoins, Landmark, LoaderCircle, Lock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import OrderSummary from './OrderSummary';
import { formatMXN, useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const METHODS = {
  tarjeta: { label: 'Tarjeta crédito / débito', icon: CreditCard },
  transferencia: { label: 'Transferencia SPEI', icon: Landmark },
  contraentrega: { label: 'Pago contra entrega', icon: HandCoins },
};

const brandOf = (num) => {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^[25]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'AMEX';
  return '';
};
const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
// Validación amigable para demo escolar:
// Requiere mínimo 13 a 16 dígitos numéricos y que empiece con 4 (VISA) o 5/2 (Mastercard).
const isValidCardNumber = (num) => {
  const d = num.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  // Debe ser VISA (empieza con 4) o Mastercard (empieza con 5 o 2)
  return /^[245]/.test(d);
};

export default function PaymentStep({ onBack, onPay }) {
  const { totals } = useStore();
  const { currentUser } = useAuth();
  const toast = useToast();

  // Clave en localStorage aislada por ID de usuario
  const userCardsKey = currentUser ? `5a-cards-${currentUser.id}` : '5a-cards-guest';

  const [savedCards, setSavedCards] = useState(() => {
    try {
      const data = localStorage.getItem(userCardsKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [selectedCardId, setSelectedCardId] = useState(() => {
    try {
      const data = localStorage.getItem(userCardsKey);
      const list = data ? JSON.parse(data) : [];
      return list.length > 0 ? list[0].id : 'new';
    } catch {
      return 'new';
    }
  });

  const [method, setMethod] = useState('tarjeta');
  const [card, setCard] = useState(() => {
    try {
      const data = localStorage.getItem(userCardsKey);
      const list = data ? JSON.parse(data) : [];
      if (list.length > 0) {
        return {
          number: list[0].number || '',
          name: list[0].name || '',
          exp: list[0].exp || '',
          cvv: '',
          msi: '1',
        };
      }
    } catch {}
    return {
      number: '',
      name: currentUser?.nombre?.toUpperCase() || '',
      exp: '',
      cvv: '',
      msi: '1',
    };
  });
  const [saveThisCard, setSaveThisCard] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Persistir tarjetas del usuario
  useEffect(() => {
    localStorage.setItem(userCardsKey, JSON.stringify(savedCards));
  }, [savedCards, userCardsKey]);

  // Selección manual de tarjeta (evita que mutaciones en savedCards reseteen el formulario)
  const handleSelectCard = (id) => {
    setSelectedCardId(id);
    setError('');
    if (id && id !== 'new') {
      const found = savedCards.find((c) => c.id === id);
      if (found) {
        setCard({
          number: found.number,
          name: found.name,
          exp: found.exp,
          cvv: '',
          msi: '1',
        });
      }
    } else {
      setCard({
        number: '',
        name: currentUser?.nombre?.toUpperCase() || '',
        exp: '',
        cvv: '',
        msi: '1',
      });
    }
  };

  const brand = brandOf(card.number);

  const removeCard = (id) => {
    const updated = savedCards.filter((c) => c.id !== id);
    setSavedCards(updated);
    if (selectedCardId === id) {
      if (updated.length > 0) {
        handleSelectCard(updated[0].id);
      } else {
        handleSelectCard('new');
      }
    }
    toast({ title: 'Tarjeta eliminada', type: 'info' });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (processing) return;
    setError('');

    if (method === 'tarjeta') {
      if (!isValidCardNumber(card.number)) {
        return setError('Ingresa un número de tarjeta válido de 16 dígitos que empiece con 4 (VISA) o 5/2 (Mastercard).');
      }
      const [mm, yy] = card.exp.split('/').map(Number);
      const now = new Date();
      if (!mm || mm < 1 || mm > 12 || !yy || new Date(2000 + yy, mm) < now) {
        return setError('La fecha de expiración no es válida o está vencida (MM/AA).');
      }
      if (card.cvv.replace(/\D/g, '').length !== 3) {
        return setError('El código de seguridad (CVV) debe tener exactamente 3 dígitos.');
      }
    }

    setProcessing(true);

    // Si es una tarjeta nueva y activó guardarla:
    if (method === 'tarjeta' && selectedCardId === 'new' && saveThisCard) {
      const newCardEntry = {
        id: `card-${Date.now()}`,
        number: card.number,
        name: card.name.trim().toUpperCase(),
        exp: card.exp,
        brand: brand || 'Tarjeta',
        last4: card.number.replace(/\D/g, '').slice(-4),
      };
      setSavedCards((prev) => [...prev, newCardEntry]);
    }

    await new Promise((r) => setTimeout(r, 1800)); // Simulación de pasarela
    setProcessing(false);

    onPay({
      method,
      label: METHODS[method].label,
      detail:
        method === 'tarjeta'
          ? `${brand || 'Tarjeta'} •••• ${card.number.slice(-4)}${card.msi !== '1' ? ` · ${card.msi} MSI` : ''}`
          : method === 'transferencia'
          ? 'Pendiente de confirmación SPEI'
          : 'Efectivo o terminal al recibir',
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <div role="radiogroup" aria-label="Método de pago" className="grid gap-3 sm:grid-cols-3">
          {Object.entries(METHODS).map(([k, m]) => (
            <label
              key={k}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-4 transition ${
                processing ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              } ${
                method === k ? 'border-navy-900 shadow-lg shadow-navy-900/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="method"
                disabled={processing}
                checked={method === k}
                onChange={() => !processing && setMethod(k)}
                className="sr-only"
              />
              <span className={`grid size-10 place-items-center rounded-xl ${method === k ? 'bg-navy-900 text-gold-400' : 'bg-slate-100 text-slate-500'}`}><m.icon className="size-5" /></span>
              <span className="text-sm font-semibold text-navy-900">{m.label}</span>
            </label>
          ))}
        </div>

        {method === 'tarjeta' && (
          <div className="space-y-6">
            {/* Selector de Tarjetas Guardadas del Usuario */}
            {savedCards.length > 0 && (
              <div className="card p-5 space-y-3">
                <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
                  <CreditCard className="size-4 text-gold-600" /> Tarjetas guardadas de tu cuenta
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedCards.map((c) => {
                    const isSelected = selectedCardId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => !processing && handleSelectCard(c.id)}
                        className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition ${
                          processing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'border-navy-900 bg-navy-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`grid size-9 place-items-center rounded-xl text-xs font-bold text-white shrink-0 ${
                            c.brand === 'VISA' ? 'bg-blue-600' : 'bg-orange-600'
                          }`}>
                            {c.brand === 'VISA' ? 'VISA' : 'MC'}
                          </span>
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-bold text-navy-900 truncate">
                              •••• {c.last4}
                            </p>
                            <p className="text-[11px] text-slate-500">Expira: {c.exp}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle2 className="size-5 text-mint-600" />}
                          <button
                            type="button"
                            disabled={processing}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCard(c.id);
                            }}
                            className="p-1.5 text-slate-300 hover:text-coral-500 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => !processing && handleSelectCard('new')}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-dashed transition ${
                      processing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      selectedCardId === 'new'
                        ? 'border-navy-900 bg-navy-50 text-navy-900 font-bold'
                        : 'border-slate-300 text-slate-500 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <Plus className="size-4" /> Añadir una nueva tarjeta
                  </div>
                </div>
              </div>
            )}

            <section className="card grid animate-fade-in gap-8 p-6 md:grid-cols-2" aria-label="Datos de tarjeta">
              {/* Vista previa de la tarjeta */}
              <div className="[perspective:1000px]" aria-hidden>
                <div
                  className="relative aspect-[1.586] w-full transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Frente de la tarjeta */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-5 text-white shadow-2xl"
                    style={{
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(1px)',
                      WebkitTransform: 'translateZ(1px)',
                      zIndex: flipped ? 0 : 2,
                      visibility: flipped ? 'hidden' : 'visible',
                    }}
                  >
                    {/* Resplandor dorado suave usando radial-gradient nativo (sin filter:blur para evitar glitches de recorte en Chromium) */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.2),transparent_60%)] pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="h-8 w-11 rounded-md bg-gradient-to-br from-gold-300 to-gold-600 shadow-sm" />
                      <div className="flex items-center h-8">
                        {brand === 'VISA' ? (
                          <svg className="h-5 w-auto text-white drop-shadow-sm transition-opacity duration-300" viewBox="0 0 48 16" fill="currentColor" aria-label="Visa">
                            <path d="M19.23 0.67L12.57 15.33H8.38L5.12 3.65C4.94 2.94 4.78 2.68 4.2 2.37C3.25 1.86 1.74 1.41 0.33 1.11L0.42 0.67H7.31C8.21 0.67 9.01 1.27 9.21 2.31L10.97 11.63L15.18 0.67H19.23ZM36.1 10.42C36.12 6.44 30.58 6.22 30.62 4.45C30.63 3.91 31.15 3.33 32.28 3.18C32.84 3.11 34.39 3.05 36.15 3.86L36.84 0.66C35.9 0.32 34.69 0 33.15 0C29.1 0 26.24 2.15 26.22 5.22C26.19 7.5 28.23 8.78 29.79 9.54C31.39 10.32 31.93 10.82 31.92 11.52C31.91 12.6 30.62 13.08 29.43 13.1C27.37 13.13 26.17 12.55 25.22 12.11L24.5 15.47C25.45 15.91 27.2 16.28 29.02 16.3C33.31 16.3 36.09 14.18 36.1 10.42ZM46.74 15.33H50.4L47.2 0.67H43.83C43.05 0.67 42.4 1.12 42.11 1.81L35.98 15.33H40.23L41.08 13.03H46.26L46.74 15.33ZM42.24 9.93L44.37 4.14L45.6 9.93H42.24ZM25.26 0.67L21.93 15.33H17.93L21.26 0.67H25.26Z" />
                          </svg>
                        ) : brand === 'Mastercard' ? (
                          <svg className="h-6 w-9 drop-shadow-sm transition-opacity duration-300" viewBox="0 0 36 24" fill="none" aria-label="Mastercard">
                            <circle cx="12" cy="12" r="10" fill="#EB001B" />
                            <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.92" />
                            <path d="M18 5.4a10 10 0 0 1 0 13.2 10 10 0 0 1 0-13.2z" fill="#FF5F00" />
                          </svg>
                        ) : brand === 'AMEX' ? (
                          <span className="font-sans text-xs font-black tracking-widest text-sky-400 border border-sky-400/40 rounded px-1.5 py-0.5">
                            AMEX
                          </span>
                        ) : (
                          <span className="font-display text-sm font-bold tracking-widest text-gold-300 italic">
                            5A PAY
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-mono text-lg tracking-[0.15em] sm:text-xl relative z-10">{card.number || '•••• •••• •••• ••••'}</p>
                    <div className="flex justify-between text-xs relative z-10">
                      <div><p className="text-[9px] uppercase text-slate-400">Titular</p><p className="truncate font-semibold uppercase">{card.name || 'NOMBRE APELLIDO'}</p></div>
                      <div className="text-right"><p className="text-[9px] uppercase text-slate-400">Expira</p><p className="font-semibold">{card.exp || 'MM/AA'}</p></div>
                    </div>
                  </div>

                  {/* Reverso de la tarjeta (completamente oculto e inerte cuando no está en CVV) */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 p-5 text-white shadow-2xl"
                    style={{
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg) translateZ(1px)',
                      WebkitTransform: 'rotateY(180deg) translateZ(1px)',
                      zIndex: flipped ? 2 : 0,
                      visibility: flipped ? 'visible' : 'hidden',
                      pointerEvents: flipped ? 'auto' : 'none',
                    }}
                  >
                    <div className="mt-2 h-9 bg-navy-950 border-y border-white/10 rounded-sm -mx-5" />
                    <div>
                      <div className="flex items-center justify-end rounded bg-white px-3 py-2 font-mono text-navy-900 font-bold text-sm tracking-widest shadow-inner">
                        {card.cvv ? card.cvv.replace(/./g, '•') : 'CVV'}
                      </div>
                      <p className="mt-1.5 text-right text-[10px] text-slate-400">Código de seguridad (3 dígitos)</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>5 a Logística Pay</span>
                      <span>Uso autorizado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <label>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="label mb-0">Número de tarjeta</span>
                    {brand && (
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider animate-fade-in ${
                        brand === 'VISA' ? 'bg-blue-600 text-white' : brand === 'Mastercard' ? 'bg-orange-600 text-white' : 'bg-navy-900 text-gold-300'
                      }`}>
                        {brand === 'VISA' ? '💳 VISA Detectada' : brand === 'Mastercard' ? '💳 Mastercard Detectada' : brand}
                      </span>
                    )}
                  </div>
                  <input
                    value={card.number}
                    onChange={(e) => setCard((c) => ({ ...c, number: formatCard(e.target.value) }))}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    className="input font-mono"
                    disabled={processing || selectedCardId !== 'new'}
                    required
                  />
                </label>
                <label>
                  <span className="label">Nombre del titular</span>
                  <input
                    value={card.name}
                    onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    autoComplete="cc-name"
                    className="input"
                    disabled={processing || selectedCardId !== 'new'}
                    required
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label>
                    <span className="label">Expiración</span>
                    <input
                      value={card.exp}
                      onChange={(e) => setCard((c) => ({ ...c, exp: formatExp(e.target.value) }))}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      className="input"
                      disabled={processing || selectedCardId !== 'new'}
                      required
                      pattern="\d{2}/\d{2}"
                    />
                  </label>
                  <label>
                    <span className="label">CVV</span>
                    <input
                      value={card.cvv}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      maxLength={3}
                      className="input"
                      disabled={processing}
                      required
                      pattern="\d{3}"
                      title="Exactamente 3 dígitos numéricos"
                    />
                  </label>
                </div>

                {selectedCardId === 'new' && (
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveThisCard}
                      disabled={processing}
                      onChange={(e) => setSaveThisCard(e.target.checked)}
                      className="size-4 accent-navy-900 rounded disabled:opacity-50"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Guardar esta tarjeta para mis próximas compras en esta cuenta
                    </span>
                  </label>
                )}

                <label>
                  <span className="label">Meses sin intereses</span>
                  <select
                    value={card.msi}
                    disabled={processing}
                    onChange={(e) => setCard((c) => ({ ...c, msi: e.target.value }))}
                    className="input cursor-pointer disabled:opacity-60"
                  >
                    <option value="1">Una sola exhibición</option>
                    {totals.total >= 1500 && <option value="3">3 MSI de {formatMXN(totals.total / 3)}</option>}
                    {totals.total >= 3000 && <option value="6">6 MSI de {formatMXN(totals.total / 6)}</option>}
                  </select>
                </label>
              </div>
            </section>
          </div>
        )}

        {method === 'transferencia' && (
          <section className="card animate-fade-in space-y-4 p-6" aria-label="Datos de transferencia">
            <p className="text-sm text-slate-600">Al confirmar, reservaremos tu pedido durante 24 h. Realiza tu transferencia SPEI con estos datos:</p>
            <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
              {[['Banco', 'BBVA México'], ['Beneficiario', '5 a Logística S.A. de C.V.'], ['CLABE', '012180001234567891'], ['Monto', formatMXN(totals.total)]].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase text-slate-500">{k}</dt>
                  <dd className="flex items-center gap-2 font-mono font-semibold text-navy-900">
                    {v}
                    {k === 'CLABE' && (
                      <button type="button" onClick={() => navigator.clipboard?.writeText(v).then(() => toast({ title: 'CLABE copiada', type: 'info' }))} className="text-slate-400 hover:text-navy-900" aria-label="Copiar CLABE"><Copy className="size-4" /></button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-slate-500">Usa tu número de orden como concepto de pago. Confirmación automática en 5–15 min.</p>
          </section>
        )}

        {method === 'contraentrega' && (
          <section className="card animate-fade-in space-y-3 p-6" aria-label="Pago contra entrega">
            <p className="text-sm text-slate-600">Paga al recibir tu pedido en efectivo o con tarjeta en la terminal móvil del repartidor.</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-500">
              <li>Disponible en CDMX y área metropolitana.</li>
              <li>Monto máximo en efectivo: $5,000 MXN.</li>
              <li>Ten el importe exacto para agilizar la entrega.</li>
            </ul>
          </section>
        )}

        {error && <p role="alert" className="rounded-xl bg-coral-500/10 p-3 text-sm font-medium text-coral-500">{error}</p>}
      </div>

      <OrderSummary>
        <button type="submit" disabled={processing} className="btn-gold w-full py-3 text-base">
          {processing ? <><LoaderCircle className="size-5 animate-spin" /> Procesando pago…</> : <><Lock className="size-4" /> Pagar {formatMXN(totals.total)}</>}
        </button>
        <button type="button" onClick={onBack} disabled={processing} className="btn-ghost w-full"><ArrowLeft className="size-4" /> Volver a envío</button>
        <p className="text-center text-[11px] text-slate-400">Pasarela simulada · no se realizan cargos reales</p>
      </OrderSummary>
    </form>
  );
}
