import React, { Suspense, useState } from 'react';
import { useLocation } from 'react-router-dom';
// useNavigate is imported for future use
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkipLinks from '@/components/SkipLinks';
import { Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

// Lazy load the RoleBasedDashboard component with error boundary
const RoleBasedDashboard = React.lazy(() =>
  import('@/components/dashboard/RoleBasedDashboard')
    .catch(error => {
      console.error('Failed to load RoleBasedDashboard:', error);
      return {
        default: () => (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Erro ao carregar o dashboard
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Não foi possível carregar o componente do dashboard. Por favor, tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )
      };
    })
);

const Dashboard = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Track route changes for debugging
  React.useEffect(() => {
    // Clean up function
    return () => {};
  }, [location]);

  return (
    <div className="flex h-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipLinks />
      <Sidebar id="sidebar" isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main id="main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6 h-[calc(100vh-64px)]">
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
                  <RoleBasedDashboard />
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
