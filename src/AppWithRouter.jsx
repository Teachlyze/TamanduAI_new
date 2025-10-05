import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ThemeProvider from './contexts/ThemeProvider';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SmartCacheProvider from './providers/SmartCacheProvider';
import App from './App';
import router from './routes/router-wrapper';

// Create a wrapper component that provides all necessary contexts
const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <AuthProvider>
      <SmartCacheProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </SmartCacheProvider>
    </AuthProvider>
  </ErrorBoundary>
);

function AppWithRouter() {
  console.log('AppWithRouter renderizado');
  
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default AppWithRouter;
