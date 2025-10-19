import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { XPProvider } from './contexts/XPContext';
import ThemeProvider from './contexts/ThemeProvider';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SmartCacheProvider from './providers/SmartCacheProvider';
import App from './App';
import TourProvider from './providers/TourProvider';
import AppRoutes from './routes/index';

// Create a wrapper component that provides all necessary contexts
const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <AuthProvider>
      <XPProvider>
        <SmartCacheProvider>
          <ThemeProvider>
            <HelmetProvider>
              <TourProvider>
                {children}
              </TourProvider>
            </HelmetProvider>
          </ThemeProvider>
        </SmartCacheProvider>
      </XPProvider>
    </AuthProvider>
  </ErrorBoundary>
);

function AppWithRouter() {
  console.log('AppWithRouter renderizado');
  
  return (
    <AppProviders>
      <BrowserRouter future={{ v7_startTransition: true }}>
        <App>
          <AppRoutes />
        </App>
      </BrowserRouter>
    </AppProviders>
  );
}

export default AppWithRouter;
