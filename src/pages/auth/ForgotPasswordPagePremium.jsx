import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import toast from 'react-hot-toast';

const ForgotPasswordPagePremium = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Digite seu e-mail');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success('E-mail de recuperação enviado!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <PremiumCard variant="elevated" className="p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-slate-900 dark:text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Recuperar Senha</h1>
                <p className="text-muted-foreground">
                  Digite seu e-mail para receber um link de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <PremiumInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={Mail}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <PremiumButton
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </PremiumButton>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </Link>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">E-mail Enviado!</h2>
              <p className="text-muted-foreground mb-6">
                Verifique sua caixa de entrada em <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                O link de recuperação é válido por 30 minutos.
              </p>
              <PremiumButton
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Voltar para Login
              </PremiumButton>
            </div>
          )}
        </PremiumCard>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPagePremium;
