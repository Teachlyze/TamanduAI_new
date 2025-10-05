import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Check if user needs onboarding
      const needsOnboarding = !(
        user.role &&
        user.terms_accepted &&
        user.privacy_accepted
      );

      if (needsOnboarding) {
        setCheckingOnboarding(true);
        navigate('/onboarding', { replace: true });
      }
    } else if (!loading && !user) {
      // If not loading and no user, redirect to login
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
    }
  }, [user, loading, navigate]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {checkingOnboarding ? 'Preparando sua experiência...' : 'Verificando autenticação...'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {checkingOnboarding ? 'Aguarde enquanto configuramos seu perfil' : 'Carregando sua sessão'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    // If no user, don't render anything (redirect is handled by useEffect)
    return null;
  }

  // If user is authenticated and onboarding is complete, render the children
  return children;
};
