import './consoleSilencer'; // MUST be first: silences noisy logs before anything else
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithRouter from './AppWithRouter';
import './index.css';
import './styles/globals.scss';
import './i18n/config'; // Initialize i18n
import './polyfills/nodePolyfills'; // Node.js polyfills for browser
import { SpeedInsights } from '@vercel/speed-insights/react';

// Silenciar logs verbosos por padrão. Defina VITE_VERBOSE_LOGS=true para reabilitar.
(() => {
  try {
    const verbose = (import.meta?.env?.VITE_VERBOSE_LOGS || '').toString().toLowerCase() === 'true';
    if (!verbose) {
      const noop = () => {};
      // Preserve warnings and errors; silence log/info/debug
      // eslint-disable-next-line no-console
      console.log = noop;
      // eslint-disable-next-line no-console
      console.info = noop;
      // eslint-disable-next-line no-console
      console.debug = noop;
    }
  } catch (_) {
    /* ignore */
  }
})();

// Verificar se o elemento root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Elemento com id "root" não encontrado no DOM');
} else {
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <AppWithRouter />
        <SpeedInsights />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Erro ao renderizar a aplicação:', error);
  }
}
