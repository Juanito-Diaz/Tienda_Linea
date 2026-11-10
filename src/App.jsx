import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingGpsTracker from './components/FloatingGpsTracker';
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
import {
  computeSimTime,
  getTrackingState,
  initOrderTracking,
  saveTrackingState,
  TOTAL_TRACKING_TIME,
} from './lib/trackingManager';

function ScrollToTop() {
  const location = useLocation();
  const categoria = new URLSearchParams(location.search).get('categoria');
  const q = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname, categoria, q]);

  return null;
}

function BackgroundTrackingNotifier() {
  const { orders } = useStore();

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
            deliveredAt: track.deliveredAt || new Date().toISOString(),
            notified: true,
            notifiedStage: 4,
          });

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
  }, [orders]);

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
      {/* Mini mapa GPS flotante en tiempo real */}
      <FloatingGpsTracker />
      <ErrorBoundary>
        <QuickViewModal productId={quickId} onClose={() => setQuickId(null)} />
      </ErrorBoundary>
    </QuickViewContext.Provider>
  );
}
