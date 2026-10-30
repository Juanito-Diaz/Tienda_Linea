import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
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
  getTrackingState,
  initOrderTracking,
  playDeliveryChime,
  saveTrackingState,
  sendBrowserNotification,
  TOTAL_TRACKING_TIME,
} from './lib/trackingManager';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), [pathname]);
  return null;
}

function BackgroundTrackingNotifier() {
  const { orders } = useStore();
  const toast = useToast();

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

        if (currentSimTime >= TOTAL_TRACKING_TIME) {
          saveTrackingState(order.number, {
            accumulatedTime: TOTAL_TRACKING_TIME,
            lastTick: Date.now(),
            delivered: true,
            deliveredAt: new Date().toISOString(),
            notified: true,
          });

          if (!track.notified) {
            toast({
              title: '¡Tu paquete ha llegado! 📦🎉',
              description: `El pedido ${order.number} fue entregado con éxito en tu domicilio.`,
              type: 'success',
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
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders, toast]);

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
        <main id="main" key={location.pathname} className="flex-1 animate-fade-in">
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
