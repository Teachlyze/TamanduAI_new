import React, { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import i18n from './i18n';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AccessibilityButton from './components/AccessibilityButton';
import PrivacyButton from './components/PrivacyButton';
import useKeyboardNavigation from '@/hooks/useKeyboardNavigation';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = ({ children }) => {
  // Initialize global keyboard navigation
  useKeyboardNavigation();

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                {children}
              </Suspense>

              {/* Accessibility and Privacy Buttons */}
              <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 items-end">
                <AccessibilityButton />
                <PrivacyButton />
              </div>

              {/* Toast Configuration */}
              <Toaster 
                position="top-center"
                containerStyle={{
                  top: '5.5rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  position: 'fixed'
                }}
                toastOptions={{
                  className: '!bg-background !text-foreground !border !border-border !shadow-lg',
                  duration: 5000,
                  style: {
                    maxWidth: '32rem',
                    width: '90vw',
                    margin: '0 auto',
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  },
                  success: {
                    className: '!bg-green-50 dark:!bg-green-900/20 !text-green-700 dark:!text-green-300 !border-green-200 dark:!border-green-800',
                    iconTheme: {
                      primary: '#10B981',
                      secondary: 'white',
                    },
                  },
                  error: {
                    className: '!bg-red-50 dark:!bg-red-900/20 !text-red-700 dark:!text-red-300 !border-red-200 dark:!border-red-800',
                  },
                }}
              />
            </div>
      </ErrorBoundary>
    </I18nextProvider>
  );
};

const App = ({ children }) => {
  return <AppContent>{children}</AppContent>;
};

export default App;
