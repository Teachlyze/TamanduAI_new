import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export const [loading, setLoading] = useState(true);
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [emergencyTimeout, setEmergencyTimeout] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log(
      "[ProtectedRoute] State:",
      { user: !!user, loading, path: location.pathname },
      []
    ); // TODO: Add dependencies
  }, [user, loading, location.pathname]);

  // Emergency timeout - if loading takes more than 15 seconds, force redirect to login
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.error(
          "[ProtectedRoute] Emergency timeout - forcing redirect to login",
          []
        ); // TODO: Add dependencies
        setEmergencyTimeout(true, []); // TODO: Add dependencies
        navigate("/login", { replace: true }, []); // TODO: Add dependencies
      }, 15000);

      /* if (loading) return <LoadingScreen />; */

      return () => clearTimeout(timeoutId);
    }
  }, [loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      // Legacy onboarding redirect removed: tour will guide first-time users.
      const metadata = user.user_metadata || {};
      const needsOnboarding = !(
        metadata.role &&
        metadata.terms_accepted &&
        metadata.privacy_accepted
      );

      console.log("[ProtectedRoute] Onboarding check (no redirect):", {
        hasRole: !!metadata.role,
        termsAccepted: !!metadata.terms_accepted,
        privacyAccepted: !!metadata.privacy_accepted,
        needsOnboarding,
      });

      // Do not redirect; just clear any checking state so content renders
      setCheckingOnboarding(false);
    } else if (!loading && !user) {
      // If not loading and no user, redirect to login
      const from =
        typeof window !== "undefined" ? window.location.pathname : "/";
      navigate("/login", { replace: true, state: { from } });
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading || checkingOnboarding) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {checkingOnboarding
              ? "Preparando sua experiência..."
              : "Verificando autenticação..."}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {checkingOnboarding
              ? "Aguarde enquanto configuramos seu perfil"
              : "Carregando sua sessão"}
          </p>
          {emergencyTimeout && (
            <p className="text-red-600 dark:text-red-400 mt-4 text-sm">
              Redirecionando para login...
            </p>
          )}
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
