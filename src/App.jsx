import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingSupport from './components/FloatingSupport';
import QuickViewModal from './components/QuickViewModal';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Tracking from './pages/Tracking';
import Orders from './pages/Orders';
import About from './pages/About';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import { QuickViewContext } from './context/QuickViewContext';
import { useStore } from './context/StoreContext';
import { useToast } from './context/ToastContext';
import {
  computeSimTime,
  getOrderStage,
  getTrackingState,
  initOrderTracking,
  playDeliveryChime,
  saveTrackingState,
  sendBrowserNotification,
  TOTAL_TRACKING_TIME,
} from './lib/trackingManager';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);
  return null;
}

function BackgroundTrackingNotifier() {
  const { orders } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const interval = setInterval(() => {
      orders.forEach((order) => {
        let track = getTrackingState(order.number);
        if (!track) {
          initOrderTracking(order.number);
          track = getTrackingState(order.number);
        }
        if (!track || track.delivered || track.paused) return;

        const currentSimTime = computeSimTime(track);
        const stage = getOrderStage(currentSimTime);
        const lastNotifiedStage = track.notifiedStage ?? (track.notified ? 4 : 0);
        const isWatchingThisOrder = location.pathname.includes(encodeURIComponent(order.number));

        if (currentSimTime >= TOTAL_TRACKING_TIME) {
          saveTrackingState(order.number, {
            accumulatedTime: TOTAL_TRACKING_TIME,
            lastTick: Date.now(),
            delivered: true,
            deliveredAt: track.deliveredAt || new Date().toISOString(),
            notified: true,
            notifiedStage: 4,
          });

          if (!track.notified) {
            toast({
              title: '¡Tu paquete ha llegado! 📦🎉',
              description: `El pedido ${order.number} fue entregado con éxito en tu domicilio. Haz clic para ver los detalles.`,
              type: 'success',
              duration: 8000,
              action: {
                label: 'Rastrear pedido 🚚',
                onClick: () => navigate(`/rastreo/${encodeURIComponent(order.number)}`),
              },
            });
            playDeliveryChime();
            sendBrowserNotification(
              '¡Tu paquete ha llegado! 📦🎉',
              `El pedido ${order.number} fue entregado con éxito en tu domicilio.`
            );
          }
          window.dispatchEvent(
            new CustomEvent('5a-tracking-update', {
              detail: { orderNumber: order.number, delivered: true },
            })
          );
        } else {
          saveTrackingState(order.number, {
            accumulatedTime: currentSimTime,
            lastTick: Date.now(),
          });

          // Notificar cambio de fase únicamente si el usuario no está viendo activamente este pedido
          if (stage > lastNotifiedStage) {
            saveTrackingState(order.number, { notifiedStage: stage });

            if (!isWatchingThisOrder) {
              if (stage === 1) {
                toast({
                  title: '📦 Pedido en preparación',
                  description: `Orden ${order.number}: Picking y empaque especializado en el Hub central.`,
                  type: 'info',
                  duration: 5000,
                  action: {
                    label: 'Rastrear pedido 🚚',
                    onClick: () => navigate(`/rastreo/${encodeURIComponent(order.number)}`),
                  },
                });
              } else if (stage === 2) {
                toast({
                  title: '🚚 ¡Tu pedido va en camino!',
                  description: `Orden ${order.number}: La camioneta de reparto ha salido hacia tu domicilio.`,
                  type: 'info',
                  duration: 5000,
                  action: {
                    label: 'Seguir en mapa 📍',
                    onClick: () => navigate(`/rastreo/${encodeURIComponent(order.number)}`),
                  },
                });
                sendBrowserNotification(
                  '🚚 Pedido en camino',
                  `La camioneta con la orden ${order.number} va en camino a tu domicilio.`
                );
              } else if (stage === 3) {
                toast({
                  title: '📍 Repartidor en ruta final',
                  description: `Orden ${order.number}: Tu repartidor está a pocas calles de tu domicilio.`,
                  type: 'info',
                  duration: 5000,
                  action: {
                    label: 'Ver ubicación en vivo 🗺️',
                    onClick: () => navigate(`/rastreo/${encodeURIComponent(order.number)}`),
                  },
                });
              }
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders, toast, navigate, location.pathname]);

  return null;
}

export default function App() {
  const [quickId, setQuickId] = useState(null);
  const location = useLocation();

  return (
    <QuickViewContext.Provider value={setQuickId}>
      <ScrollToTop />
      <BackgroundTrackingNotifier />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main id="main" className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/rastreo" element={<Tracking />} />
              <Route path="/rastreo/:order" element={<Tracking />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/ayuda" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
      <FloatingSupport />
      <ErrorBoundary>
        <QuickViewModal productId={quickId} onClose={() => setQuickId(null)} />
      </ErrorBoundary>
    </QuickViewContext.Provider>
  );
}
