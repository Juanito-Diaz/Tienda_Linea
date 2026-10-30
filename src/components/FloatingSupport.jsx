import { useEffect, useRef, useState } from 'react';
import { Headphones, MessageCircle, Send, X } from 'lucide-react';
import { SocialIcon, SUPPORT_WHATSAPP } from './ui';

const QUICK = ['¿Dónde está mi pedido?', 'Tiempos de entrega', 'Devoluciones', '¿Son originales los cosméticos?'];

function botReply(text) {
  const t = text.toLowerCase();
  if (t.includes('pedido') || t.includes('dónde') || t.includes('rastre'))
    return 'Puedes ver tu camioneta en tiempo real en la sección "Rastrear pedido" con tu número #5A-LOG-XXXXX. 🚚';
  if (t.includes('tiempo') || t.includes('entrega') || t.includes('llega'))
    return 'CDMX y área metropolitana: 24 h. Resto del país: 2 a 4 días hábiles. Café recién tostado sale cada martes y viernes.';
  if (t.includes('devol'))
    return 'Tienes 30 días para devoluciones de ropa y accesorios sin usar. Cosméticos solo si están sellados. ¡La recolección es gratis!';
  if (t.includes('original') || t.includes('autent'))
    return 'Sí ✅. Compramos directo a distribuidores oficiales y cada lote incluye certificado de autenticidad y QR verificable.';
  return 'Gracias por escribirnos. Un agente humano se unirá en breve; si prefieres, continúa por WhatsApp. 💬';
}

/** Botón flotante de soporte con panel de chat en vivo. */
export default function FloatingSupport() {
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '¡Hola! Soy Ana del equipo de 5 a Logística. ¿En qué te ayudo hoy?' },
  ]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'me', text }]);
    setMsg('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: 'bot', text: botReply(text) }]);
    }, 900);
  };

  return (
    <div className="no-print">
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Cerrar chat de soporte' : 'Abrir chat en vivo'}
          className="grid size-14 place-items-center rounded-full bg-navy-900 text-gold-400 shadow-2xl ring-4 ring-gold-500/30 transition hover:scale-105 cursor-pointer"
        >
          {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-labelledby="chat-title"
          className="fixed bottom-24 right-5 z-40 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-up"
          style={{ width: 'min(22rem, calc(100vw - 2.5rem))', height: 'min(30rem, calc(100vh - 8rem))' }}
        >
          <header className="flex items-center gap-3 bg-navy-900 p-4 text-white">
            <span className="relative grid size-10 place-items-center rounded-full bg-gold-500 text-navy-950">
              <Headphones className="size-5" />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-mint-500 ring-2 ring-navy-900" />
            </span>
            <div className="flex-1">
              <h2 id="chat-title" className="text-sm font-semibold">Soporte en vivo</h2>
              <p className="text-xs text-slate-300">En línea · responde en ~1 min</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/10 cursor-pointer"
              aria-label="Cerrar chat"
            >
              <X className="size-4" />
            </button>
          </header>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                m.from === 'me' ? 'ml-auto rounded-br-sm bg-navy-900 text-white' : 'rounded-bl-sm bg-white text-navy-900 shadow-sm'
              }`}
            >
              {m.text}
            </p>
          ))}
          {typing && <p className="w-16 rounded-2xl bg-white px-3.5 py-2 text-sm tracking-widest text-slate-400 shadow-sm">•••</p>}
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-t border-slate-100 px-3 py-2">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="chip shrink-0 border-slate-200 bg-white hover:border-navy-900">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(msg);
          }}
          className="flex gap-2 border-t border-slate-100 p-3"
        >
          <input value={msg} onChange={(e) => setMsg(e.target.value)} className="input" placeholder="Escribe tu mensaje…" aria-label="Mensaje" />
          <button className="btn-primary px-3" aria-label="Enviar">
            <Send className="size-4" />
          </button>
        </form>
        <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366]/10 py-2 text-xs font-semibold text-[#128C7E]">
          <SocialIcon name="whatsapp" className="size-4" /> Continuar en WhatsApp
        </a>
      </div>
      )}
    </div>
  );
}
