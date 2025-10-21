import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { motion } from 'framer-motion';
import { LogOut, Loader2 } from 'lucide-react';

  const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('logging_out'); // 'logging_out' | 'success'

  useEffect(() => {
    const performLogout = async () => {
      try {
        setStatus('logging_out');
        await logout();
        setStatus('success');
        
        // Aguarda animação antes de redirecionar
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        navigate('/', { replace: true });
      }
    };
    
    performLogout();
  }, [logout, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: status === 'success' ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          {status === 'logging_out' ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : (
            <LogOut className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {status === 'logging_out' ? 'Saindo...' : 'Até logo!'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300"
        >
          {status === 'logging_out' 
            ? 'Encerrando sua sessão com segurança...' 
            : 'Logout realizado com sucesso!'}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LogoutPage;
