import { useState, useEffect } from 'react';
import { CircleCheck, CreditCard, MapPin, ShoppingBag, Lock, LogIn, UserPlus } from 'lucide-react';
import Stepper from '../components/checkout/Stepper';
import CartStep from '../components/checkout/CartStep';
import ShippingStep from '../components/checkout/ShippingStep';
import PaymentStep from '../components/checkout/PaymentStep';
import ConfirmationStep from '../components/checkout/ConfirmationStep';
import AuthModal from '../components/AuthModal';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { initOrderTracking, requestNotificationPermission } from '../lib/trackingManager';

const STEPS = [
  { label: 'Carrito', icon: ShoppingBag },
  { label: 'Envío', icon: MapPin },
  { label: 'Pago', icon: CreditCard },
  { label: 'Confirmación', icon: CircleCheck },
];

const EMPTY_SHIPPING = {
  nombre: '',
  email: '',
  telefono: '',
  calle: '',
  numero: '',
  colonia: '',
  cp: '',
  ciudad: '',
  estado: 'Ciudad de México',
  referencias: '',
  entrega: 'estandar',
  coords: null,
};

const cleanPhone = (v) => (v ? String(v).replace(/\D/g, '').slice(0, 10) : '');

export default function Checkout() {
  const { placeOrder } = useStore();
  const { currentUser, updateUser } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const userShippingKey = currentUser ? `5a-shipping-${currentUser.id}` : '5a-shipping-guest';

  const [shipping, setShipping] = useState(() => {
    let saved = {};
    try {
      const raw = localStorage.getItem(userShippingKey);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    return {
      ...EMPTY_SHIPPING,
      ...saved,
      nombre: saved.nombre || currentUser?.nombre || '',
      email: saved.email || currentUser?.email || '',
      telefono: cleanPhone(saved.telefono || currentUser?.telefono),
    };
  });
  const [order, setOrder] = useState(null);

  // Actualizar datos de contacto y envío guardados si el usuario inicia sesión
  useEffect(() => {
    if (currentUser) {
      let saved = {};
      try {
        const raw = localStorage.getItem(`5a-shipping-${currentUser.id}`);
        if (raw) saved = JSON.parse(raw);
      } catch {}

      setShipping((prev) => ({
        ...prev,
        ...saved,
        nombre: saved.nombre || currentUser.nombre || prev.nombre,
        email: saved.email || currentUser.email || prev.email,
        telefono: cleanPhone(saved.telefono || currentUser.telefono || prev.telefono),
      }));
    }
  }, [currentUser]);

  // Al cambiar de paso, desplazar la pantalla inmediatamente al inicio superior (vital en móviles)
  useEffect(() => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 60);
    return () => clearTimeout(timer);
  }, [step]);

  const go = (n) => {
    // Si intenta avanzar al paso de Envío (1) o Pago (2) sin haber iniciado sesión:
    if (n > 0 && !currentUser) {
      toast({
        title: 'Inicio de sesión requerido',
        description: 'Debes iniciar sesión o registrarte previamente para continuar tu compra.',
        type: 'error',
      });
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    // Transición fluida entre pasos con View Transitions cuando está disponible
    const update = () => {
      setStep(n);
      window.scrollTo(0, 0);
    };

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="section-title no-print mb-8">{step === 3 ? 'Pedido confirmado' : 'Finalizar compra'}</h1>

      {/* Alerta visible si no tiene sesión iniciada en el carrito */}
      {!currentUser && step === 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
              <Lock className="size-5" />
            </span>
            <div>
              <p className="font-bold text-sm sm:text-base">Necesitas iniciar sesión previamente para comprar</p>
              <p className="text-xs sm:text-sm text-amber-800">
                Inicia sesión con tu cuenta o crea una nueva para proceder con el envío y rastreo.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthModalOpen(true);
              }}
              className="btn-primary py-2 px-4 text-xs flex-1 sm:flex-initial"
            >
              <LogIn className="size-3.5" /> Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthModalOpen(true);
              }}
              className="btn-ghost py-2 px-4 text-xs flex-1 sm:flex-initial"
            >
              <UserPlus className="size-3.5" /> Registrarse
            </button>
          </div>
        </div>
      )}

      <div className="mb-10">
        <Stepper steps={STEPS} current={step} onStepClick={go} />
      </div>

      {step === 0 && <CartStep onNext={() => go(1)} />}
      {step === 1 && (
        <ShippingStep
          data={shipping}
          onBack={() => go(0)}
          onNext={(data) => {
            setShipping(data);
            try {
              localStorage.setItem(userShippingKey, JSON.stringify(data));
            } catch {}
            if (currentUser) {
              updateUser({ telefono: data.telefono, nombre: data.nombre });
            }
            requestNotificationPermission();
            go(2);
          }}
        />
      )}
      {step === 2 && (
        <PaymentStep
          onBack={() => go(1)}
          onPay={(payment) => {
            const o = placeOrder({ shipping, payment });
            initOrderTracking(o.number);
            setOrder(o);
            toast({ title: 'Pago aprobado', description: `Orden ${o.number} generada` });
            go(3);
          }}
        />
      )}
      {step === 3 && order && <ConfirmationStep order={order} />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
