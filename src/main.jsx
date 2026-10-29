import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Polyfill condicional del Popover API (solo navegadores antiguos)
if (!('popover' in HTMLElement.prototype)) {
  import(/* @vite-ignore */ 'https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>
);
