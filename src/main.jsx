import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithRouter from './AppWithRouter';
import './index.css';
import './styles/globals.scss';
import './i18n/config'; // Initialize i18n
import './polyfills/nodePolyfills'; // Node.js polyfills for browser

console.log('Iniciando aplicação TamanduAI...');

// Verificar se o elemento root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Elemento com id "root" não encontrado no DOM');
} else {
  console.log('Elemento root encontrado, criando raiz do React...');
  
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('Raiz do React criada com sucesso, renderizando a aplicação...');
    
    root.render(
      <React.StrictMode>
        <AppWithRouter />
      </React.StrictMode>
    );
    
    console.log('Aplicação TamanduAI renderizada com sucesso!');
  } catch (error) {
    console.error('Erro ao renderizar a aplicação:', error);
  }
}
