import { useEffect, useRef, useState } from 'react';
import { X, User, Mail, Lock, Phone, UserPlus, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [error, setError] = useState('');

  // Form states
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        className="fixed inset-0 bg-navy-950/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-8">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-navy-900 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="size-5" />
        </button>

        {/* Encabezado elegante */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 text-gold-400 shadow-xl shadow-navy-900/20 ring-1 ring-gold-500/30">
            {isRegister ? <UserPlus className="size-7" /> : <LogIn className="size-7" />}
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            {isRegister ? 'Crear Cuenta' : 'Bienvenido de Vuelta'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isRegister
              ? 'Regístrate en 5 a Logística y obtén beneficios en envíos'
              : 'Ingresa a tu cuenta para continuar con tus pedidos'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-4 rounded-xl border border-coral-200 bg-coral-50 p-3 text-xs font-semibold text-coral-600 animate-fade-in flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError('');

            if (isRegister) {
              if (!nombre.trim() || !email.trim() || !password.trim()) {
                setError('Por favor completa todos los campos requeridos.');
                return;
              }
              const res = register({ nombre, email, password, telefono });
              if (res.success) {
                toast({
                  title: '¡Cuenta creada!',
                  description: `Bienvenido(a) a 5 a Logística, ${res.user.nombre}.`,
                  type: 'success',
                });
                onClose();
              } else {
                setError(res.message);
              }
            } else {
              if (!email.trim() || !password.trim()) {
                setError('Por favor escribe tu correo y contraseña.');
                return;
              }
              const res = login(email, password);
              if (res.success) {
                toast({
                  title: 'Sesión iniciada',
                  description: `Hola de nuevo, ${res.user.nombre}.`,
                  type: 'success',
                });
                onClose();
              } else {
                setError(res.message);
              }
            }
          }}
          className="space-y-4"
        >
          {isRegister && (
            <label className="block">
              <span className="label">Nombre completo</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Sofía Hernández"
                  className="input pl-10"
                  required
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="label">Correo electrónico</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.mx"
                className="input pl-10"
                required
              />
            </div>
          </label>

          {isRegister && (
            <label className="block">
              <span className="label">Teléfono móvil (opcional)</span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="55 1234 5678"
                  className="input pl-10"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="label">Contraseña</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10"
                required
              />
            </div>
          </label>

          {isRegister ? (
            <div className="flex items-center gap-2 rounded-xl bg-gold-100/60 border border-gold-300/40 p-3 text-xs text-gold-900">
              <Sparkles className="size-4 shrink-0 text-gold-600" />
              <span>¡Recibes <strong>+250 puntos</strong> de fidelidad automáticamente!</span>
            </div>
          ) : (
            <div className="flex items-center justify-end text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setEmail('lily@correo.mx');
                  setPassword('123');
                }}
                className="font-semibold text-gold-700 hover:underline cursor-pointer"
              >
                Autocompletar demo
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-navy-900/25"
          >
            {isRegister ? 'Crear mi cuenta' : 'Ingresar a mi cuenta'}
          </button>
        </form>

        {/* Footer switch */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          {isRegister ? (
            <p>
              ¿Ya tienes cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="font-bold text-navy-900 underline hover:text-gold-700 cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Aún no tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="font-bold text-navy-900 underline hover:text-gold-700 cursor-pointer"
              >
                Regístrate gratis
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
