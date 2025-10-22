// src/pages/JoinClassPage.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogIn,
  UserPlus,
  ArrowRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JoinClassPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const token = searchParams.get('token');
  const classId = searchParams.get('classId');

  const fetchInviteData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invites/${token}`);
      const data = await response.json();

      if (response.ok) {
        setInviteData(data.invite);
      } else {
        setError(data.message || 'Erro ao carregar dados do convite');
      }
    } catch (err) {
      setError('Erro ao processar o convite');
      console.error('Error fetching invite data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && classId) {
      fetchInviteData();
    } else {
      setError('Link de convite inválido');
      setLoading(false);
    }
  }, [token, classId, fetchInviteData]);

  const handleJoinClass = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      setJoining(true);
      const response = await fetch(`/api/invites/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to class dashboard
        navigate(`/dashboard/classes/${classId}`);
      } else {
        setError(data.message || 'Erro ao entrar na turma');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setJoining(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      setShowLogin(false);
      // After login, try to join class again
      await handleJoinClass();
    } catch (err) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const handleRegister = () => {
    navigate('/register', { state: { redirectTo: `/join-class?token=${token}&classId=${classId}` } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Carregando convite...</p>
        </div>
      </div>
    );
  }

  if (error && !showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Erro no Convite
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Fazer Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={joining}>
                {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Entrar
              </Button>
              <Button type="button" variant="outline" onClick={handleRegister} className="bg-white dark:bg-slate-900 text-foreground border-border w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Convite Não Encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Este convite pode ter expirado ou ser inválido.
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white hover:opacity-90">
              <GraduationCap className="w-10 h-10 text-slate-900 dark:text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Convite para Turma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {inviteData.className}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {inviteData.subject}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Professor: {inviteData.teacherName}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Turma criada em
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {user ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você está logado como <strong>{user.name}</strong>
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleJoinClass}
                  disabled={joining}
                  className="w-full"
                  size="lg"
                >
                  {joining ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Users className="w-5 h-5 mr-2" />
                  )}
                  {joining ? 'Entrando na turma...' : 'Entrar na Turma'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Você precisa estar logado para entrar na turma
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => setShowLogin(true)} variant="outline">
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                  <Button onClick={handleRegister}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Convite expira em: {new Date(inviteData.expiresAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinClassPage;
