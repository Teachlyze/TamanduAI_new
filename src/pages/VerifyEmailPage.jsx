import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { navigateToHome } from '@/utils/roleNavigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already verified, redirect to appropriate home
    if (user?.email_confirmed_at) {
      const role = user.user_metadata?.role || 'student';
      navigateToHome(navigate, role);
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!user?.email) {
      setError('Email não encontrado. Por favor, faça login novamente.');
      return;
    }

    setIsResending(true);
    setError('');
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setResendSuccess(true);
    } catch (err) {
      setError(err.message || 'Falha ao reenviar email. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Verifique seu email</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para <strong>{user?.email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Próximos passos:</h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
                <li>Abra seu email</li>
                <li>Clique no link de confirmação que enviamos</li>
                <li>Volte aqui e faça login</li>
              </ol>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Email reenviado com sucesso!
              </motion.div>
            )}

            <div className="text-center text-sm text-gray-600">
              Não recebeu o email?{' '}
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                {isResending ? (
                  <span className="inline-flex items-center gap-1">
                    <Icons.spinner className="h-3 w-3 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Reenviar
                  </span>
                )}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex-col space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
