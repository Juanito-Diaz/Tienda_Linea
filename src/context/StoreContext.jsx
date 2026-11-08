import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '../data/products';
import { useAuth } from './AuthContext';
import { initOrderTracking, computeSimTime, getTrackingState, saveTrackingState } from '../lib/trackingManager';

const StoreContext = createContext(null);

const TAX_RATE = 0.16; // IVA México
export const PACKAGING = {
  estandar: { label: 'Empaque estándar', desc: 'Caja reciclada con protección básica', price: 0 },
  delicado: { label: 'Empaque para delicados', desc: 'Burbuja + espuma, ideal para cosméticos y vidrio', price: 49 },
  regalo: { label: 'Empaque de regalo premium', desc: 'Caja rígida navy con listón dorado y tarjeta', price: 129 },
};
export const DELIVERY_METHODS = {
  estandar: {
    id: 'estandar',
    label: 'Estándar 24 h',
    desc: 'Siguiente día hábil',
    surcharge: 0,
    surchargeLabel: 'Sin costo extra',
  },
  express: {
    id: 'express',
    label: 'Exprés Hoy Mismo',
    desc: 'Entrega el mismo día hábil en CDMX y Edo. Méx.',
    surcharge: 89,
    surchargeLabel: '+$89.00 MXN',
  },
  flash: {
    id: 'flash',
    label: 'Flash Prioritario (2-3 h)',
    desc: 'Repartidor dedicado directo a tu domicilio',
    surcharge: 149,
    surchargeLabel: '+$149.00 MXN',
  },
};
export const SHIPPING_FREE_FROM = 699;
export const SHIPPING_COST = 119;

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const formatMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n);

export const lineKey = (productId, variant, extra) => [productId, variant ?? '', extra ?? ''].join('|');

export function unitPrice(product, variantValue) {
  if (!product) return 0;
  const opt = product.variants?.options?.find((o) => o.value === variantValue);
  return (product.price ?? 0) + (opt?.priceDelta ?? 0);
}

// Cargar el carrito guardado del usuario con migración limpia
const loadUserCart = (uid) => {
  try {
    const userCart = load(`5a-cart-${uid}`, null);
    if (userCart !== null && Array.isArray(userCart) && userCart.length > 0) {
      return userCart;
    }
    const tempCart = load('5a-cart', null);
    if (tempCart !== null && Array.isArray(tempCart) && tempCart.length > 0) {
      localStorage.setItem(`5a-cart-${uid}`, JSON.stringify(tempCart));
      localStorage.removeItem('5a-cart');
      return tempCart;
    }
    return userCart || [];
  } catch {
    return [];
  }
};

// Limpieza de carritos temporales de invitados en localStorage
try {
  localStorage.removeItem('5a-cart-guest');
} catch {}

export function StoreProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.id : null;
  const userKey = userId || 'guest';
  const prevUserIdRef = useRef(userId);

  // Inicialización: si hay usuario autenticado, cargar su carrito; si no hay usuario, el carrito inicia vacío []
  const [cart, setCart] = useState(() => (userId ? loadUserCart(userId) : []));

  // Todos los pedidos persistidos en el almacenamiento
  const [allOrders, setAllOrders] = useState(() => {
    const unified = load('5a-orders', null);
    if (unified !== null) return unified;
    const guestOrders = load('5a-orders-guest', []);
    const userOrders = load('5a-orders-u-1', []);
    const combined = [...userOrders, ...guestOrders];
    const seen = new Set();
    return combined.filter((o) => {
      if (!o?.number || seen.has(o.number)) return false;
      seen.add(o.number);
      return true;
    });
  });

  // Filtrar pedidos visibles según la sesión actual:
  // - Usuario autenticado: sus pedidos
  // - No autenticado (invitado / cerró sesión): solo pedidos hechos como invitado (o [] si no hay)
  const orders = useMemo(() => {
    if (!userId) {
      return allOrders.filter((o) => o.userId === 'guest');
    }
    return allOrders.filter((o) => o.userId === userId || (!o.userId && userId === 'u-1'));
  }, [allOrders, userId]);

  const [packaging, setPackaging] = useState('estandar');
  const [deliveryMethod, setDeliveryMethod] = useState('estandar');

  // Gestión de sesión:
  // - Al cerrar sesión: los productos se van y se PAUSAN/CONGELAN los pedidos en curso en su progreso actual
  // - Al iniciar sesión: los productos guardados de la cuenta vuelven a aparecer y se REANUDAN los pedidos en curso
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    if (prevUserId !== userId) {
      prevUserIdRef.current = userId;

      if (userId) {
        // Inició sesión -> Cargar los productos guardados de esta cuenta
        const userSaved = loadUserCart(userId);
        setCart(userSaved);

        // Reanudar el seguimiento de los pedidos activos de este usuario que hayan sido pausados al salir
        allOrders
          .filter((o) => o.userId === userId || (!o.userId && userId === 'u-1'))
          .forEach((o) => {
            const track = getTrackingState(o.number);
            if (track && !track.delivered) {
              saveTrackingState(o.number, {
                paused: false,
                lastTick: Date.now(),
              });
            }
          });
      } else {
        // Cerró sesión -> Se vacía el carrito en pantalla (sin usuario = sin artículos)
        setCart([]);

        // Pausar y congelar los pedidos del usuario que acaba de salir en su progreso exacto
        if (prevUserId) {
          allOrders
            .filter((o) => o.userId === prevUserId || (!o.userId && prevUserId === 'u-1'))
            .forEach((o) => {
              const track = getTrackingState(o.number);
              if (track && !track.delivered) {
                const currentSim = computeSimTime(track);
                saveTrackingState(o.number, {
                  accumulatedTime: currentSim,
                  paused: true,
                  lastTick: Date.now(),
                });
              }
            });
        }
      }
    }
  }, [userId, allOrders]);

  // Persistir cambios en el carrito de la cuenta del usuario autenticado
  useEffect(() => {
    if (userId && prevUserIdRef.current === userId) {
      localStorage.setItem(`5a-cart-${userId}`, JSON.stringify(cart));
    }
  }, [cart, userId]);

  useEffect(() => {
    localStorage.setItem('5a-orders', JSON.stringify(allOrders));
  }, [allOrders]);

  const addToCart = useCallback((productId, variant, qty = 1, extra) => {
    const key = lineKey(productId, variant, extra);
    setCart((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 20) } : l));
      return [...prev, { key, productId, variant, extra, qty }];
    });
  }, []);

  const updateQty = useCallback((key, qty) => {
    setCart((prev) => (qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 20) } : l))));
  }, []);

  const removeLine = useCallback((key) => setCart((prev) => prev.filter((l) => l.key !== key)), []);
  const clearCart = useCallback(() => {
    setCart([]);
    if (userId) {
      localStorage.setItem(`5a-cart-${userId}`, JSON.stringify([]));
    }
  }, [userId]);

  const lines = useMemo(
    () =>
      cart
        .map((l) => {
          const product = getProduct(l.productId);
          if (!product) return null;
          const price = unitPrice(product, l.variant);
          return { ...l, product, price, total: price * l.qty };
        })
        .filter(Boolean),
    [cart]
  );

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const pack = lines.length ? PACKAGING[packaging]?.price || 0 : 0;
    const baseShipping = subtotal === 0 || subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING_COST;
    const deliveryExtra = lines.length ? (DELIVERY_METHODS[deliveryMethod]?.surcharge || 0) : 0;
    const shipping = lines.length ? baseShipping + deliveryExtra : 0;
    // Precios mostrados con IVA incluido; desglosamos el impuesto.
    const base = subtotal / (1 + TAX_RATE);
    const tax = subtotal - base;
    const total = subtotal + pack + shipping;
    return {
      subtotal,
      base,
      tax,
      pack,
      baseShipping,
      deliveryExtra,
      shipping,
      total,
      count: lines.reduce((s, l) => s + l.qty, 0),
    };
  }, [lines, packaging, deliveryMethod]);

  const placeOrder = useCallback(
    ({ shipping, payment }) => {
      const number = `#5A-LOG-${Math.floor(10000 + Math.random() * 90000)}`;
      const order = {
        number,
        userId: userKey,
        createdAt: new Date().toISOString(),
        lines: lines.map(({ product, ...l }) => ({
          ...l,
          category: product.category,
          variant: product.variants?.options.find((o) => o.value === l.variant)?.label ?? l.variant,
          name: product.name,
          brand: product.brand,
          image: product.images[0],
        })),
        totals,
        packaging,
        deliveryMethod,
        shipping: {
          ...shipping,
          entrega: deliveryMethod,
        },
        payment,
      };
      initOrderTracking(number);
      setAllOrders((prev) => [order, ...prev]);
      setCart([]);
      if (userId) {
        localStorage.setItem(`5a-cart-${userId}`, JSON.stringify([]));
      }
      return order;
    },
    [lines, totals, packaging, deliveryMethod, userKey, userId]
  );

  const value = {
    cart,
    lines,
    totals,
    packaging,
    setPackaging,
    deliveryMethod,
    setDeliveryMethod,
    addToCart,
    updateQty,
    removeLine,
    clearCart,
    orders,
    placeOrder,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
