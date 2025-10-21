import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AccessibilityButton from './components/AccessibilityButton';
import useKeyboardNavigation from '@/hooks/useKeyboardNavigation';
import { GlobalAccessibility } from './components/ui/GlobalAccessibility';
import { PremiumToaster, CommandPalette } from '@/components/ui';
import { monitorPerformance } from '@/utils/performance';
import { useAuth } from '@/hooks/useAuth';
import XPNotificationProvider from '@/components/gamification/XPNotificationProvider';

// Componente para aplicar configurações de acessibilidade globalmente
const AccessibilityProvider = ({ children }) => {
  useEffect(() => {
    // Aplicar configurações salvas no localStorage
    const applyAccessibilitySettings = () => {
      try {
        const settings = localStorage.getItem('accessibility-settings');
        if (settings) {
          const parsed = JSON.parse(settings);

          // Aplicar configurações no documentElement
          const root = document.documentElement;

          if (parsed.fontSize) {
            root.style.fontSize = `${parsed.fontSize}px`;
          }

          if (parsed.lineSpacing) {
            root.style.lineHeight = parsed.lineSpacing;
          }

          if (parsed.letterSpacing !== undefined) {
            root.style.letterSpacing = `${parsed.letterSpacing}px`;
          }

          if (parsed.highContrast) {
            root.classList.add('high-contrast');
          } else {
            root.classList.remove('high-contrast');
          }
        }
      } catch (error) {
        console.warn('Erro ao aplicar configurações de acessibilidade:', error);
      }
    };

    applyAccessibilitySettings();

    // Ouvir mudanças no localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'accessibility-settings') {
        applyAccessibilitySettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return <>{children}</>;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Initialize global keyboard navigation
  useKeyboardNavigation();

  // Initialize performance monitoring
  useEffect(() => {
    monitorPerformance();
  }, []);

  // Mostrar botão de acessibilidade apenas na landing page (não logado)
  const isLandingPage = !user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register');

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <GlobalAccessibility />
        <AccessibilityProvider>
          <XPNotificationProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-background text-foreground">
              <Helmet>
                <title>TamanduAI — Plataforma EdTech Inteligente</title>
                <meta name="description" content="Plataforma educacional com IA para alunos, professores e escolas: questões, atividades, correções, analytics e gestão." />
                <link rel="canonical" href={import.meta.env.VITE_APP_URL || 'https://tamanduai.com'} />
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="TamanduAI" />
                <meta property="og:url" content={import.meta.env.VITE_APP_URL || 'https://tamanduai.com'} />
                <meta property="og:title" content="TamanduAI — Plataforma EdTech Inteligente" />
                <meta property="og:description" content="IA educacional: banco de questões, quizzes, correção automática, gamificação e gestão escolar." />
                <meta property="og:image" content={(import.meta.env.VITE_APP_URL || 'https://tamanduai.com') + '/og-cover.jpg'} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="TamanduAI — Plataforma EdTech Inteligente" />
                <meta name="twitter:description" content="IA educacional para alunos, professores e escolas." />
                <meta name="twitter:image" content={(import.meta.env.VITE_APP_URL || 'https://tamanduai.com') + '/og-cover.jpg'} />
              </Helmet>
              {/* Premium Toast System */}
              <PremiumToaster />
              
              {/* Command Palette (⌘K) */}
              <CommandPalette />

              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                {children}
              </Suspense>

              {/* Accessibility Button - Apenas na landing page (não logado) */}
              {isLandingPage && (
                <div className="fixed bottom-6 left-6 z-40">
                  <AccessibilityButton />
                </div>
              )}
            </div>
          </XPNotificationProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    </I18nextProvider>
  );
};

const App = ({ children }) => {
  return <AppContent>{children}</AppContent>;
};

export default App;
