import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct } from '../data/products';
import { useAuth } from './AuthContext';
import { initOrderTracking } from '../lib/trackingManager';

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

export function StoreProvider({ children }) {
  const { currentUser } = useAuth();
  const userKey = currentUser ? currentUser.id : 'guest';

  // Carritos por usuario: '5a-cart-u-1', '5a-cart-guest', etc.
  const [cart, setCart] = useState(() => load(`5a-cart-${userKey}`, []));
  const [orders, setOrders] = useState(() => load(`5a-orders-${userKey}`, []));
  const [packaging, setPackaging] = useState('estandar');
  const [deliveryMethod, setDeliveryMethod] = useState('estandar');

  // Cuando cambia el usuario actual (login, logout o cambio de cuenta), cargamos su carrito y sus pedidos
  useEffect(() => {
    setCart(load(`5a-cart-${userKey}`, []));
    setOrders(load(`5a-orders-${userKey}`, []));
  }, [userKey]);

  useEffect(() => localStorage.setItem(`5a-cart-${userKey}`, JSON.stringify(cart)), [cart, userKey]);
  useEffect(() => localStorage.setItem(`5a-orders-${userKey}`, JSON.stringify(orders)), [orders, userKey]);

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
  const clearCart = useCallback(() => setCart([]), []);

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
      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [lines, totals, packaging, deliveryMethod, userKey]
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
