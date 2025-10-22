import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import toast from 'react-hot-toast';

const EmailConfirmationPage = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token || type !== 'email') {
        setStatus('error');
        setMessage('Link de confirmação inválido ou expirado.');
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });

        if (error) throw error;

        setStatus('success');
        setMessage('E-mail confirmado com sucesso!');
        toast.success('E-mail verificado!');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Erro ao confirmar email:', error);
        setStatus('error');
        setMessage(error.message || 'Ocorreu um erro ao confirmar seu e-mail.');
        toast.error('Erro na verificação');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, type, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <PremiumCard variant="elevated" className="p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verificando Email</h2>
              <p className="text-muted-foreground">Aguarde enquanto confirmamos seu email...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">Email Confirmado!</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">Redirecionando para login...</p>
            </motion.div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Erro na Confirmação</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex gap-3">
                <PremiumButton
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                >
                  Tentar Novamente
                </PremiumButton>
                <PremiumButton
                  onClick={() => navigate('/login')}
                  className="flex-1 whitespace-nowrap inline-flex items-center gap-2 min-w-fit px-4 py-2"
                >
                  Ir para Login
                </PremiumButton>
              </div>
            </div>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default EmailConfirmationPage;
