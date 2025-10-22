import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithRouter from './AppWithRouter';
import './index.css';
import './styles/globals.scss';
import './i18n/config'; // Initialize i18n
import './polyfills/nodePolyfills'; // Node.js polyfills for browser
import { SpeedInsights } from '@vercel/speed-insights/react';

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
