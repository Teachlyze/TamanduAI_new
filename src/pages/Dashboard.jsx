import React, { Suspense, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
// useNavigate is imported for future use
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkipLinks from '@/components/SkipLinks';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { SidebarPremium } from '@/components/ui/SidebarPremium';

// Conteúdo das rotas aninhadas será renderizado via <Outlet />

const Dashboard = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Iniciar fechado em mobile

  // Track route changes for debugging
  React.useEffect(() => {
    // Clean up function
    return () => {};
  }, [location]);

  return (
    <div className="flex h-full min-h-screen bg-background">
      <SkipLinks />
      <SidebarPremium isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden h-full lg:ml-[280px]">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 h-[calc(100vh-64px)]">
          <ErrorBoundary errorTitle="Erro no Dashboard" errorMessage="Não foi possível carregar o dashboard. Tente recarregar a página.">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
