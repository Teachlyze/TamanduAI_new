import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { GraduationCap, Mail, Lock, User, Loader2, CheckCircle2, School } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterTeacherPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const schoolName = searchParams.get('school');

  const [loading, setLoading] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    validateInvite();
  }, [inviteToken]);

  const validateInvite = async () => {
    if (!inviteToken) {
      toast.error('Link de convite inválido');
      setValidatingInvite(false);
      return;
    }

    try {
      setValidatingInvite(true);

      // Buscar convite no banco
      const { data: invite, error } = await supabase
        .from('teacher_invites')
        .select('*, schools(id, name)')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single();

      if (error || !invite) {
        toast.error('Convite não encontrado ou já foi utilizado');
        setInviteValid(false);
        return;
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        toast.error('Este convite expirou');
        setInviteValid(false);
        return;
      }

      setInviteData(invite);
      setInviteValid(true);
      
      // Preencher email e nome se disponível
      if (invite.email) {
        setFormData(prev => ({ ...prev, email: invite.email }));
      }
      if (invite.teacher_name) {
        setFormData(prev => ({ ...prev, fullName: invite.teacher_name }));
      }

      toast.success(`Bem-vindo(a) à ${invite.schools?.name || schoolName}!`);
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      toast.error('Erro ao validar convite');
      setInviteValid(false);
    } finally {
      setValidatingInvite(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'teacher',
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }

      // 2. Criar perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email,
        role: 'teacher',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (profileError && profileError.code !== '23505') {
        console.warn('Erro ao criar perfil:', profileError);
      }

      // 3. Vincular professor à escola
      if (inviteData?.school_id) {
        const { error: linkError } = await supabase.from('school_teachers').insert({
          school_id: inviteData.school_id,
          user_id: authData.user.id,
          status: 'active',
          joined_at: new Date().toISOString(),
        });

        if (linkError && linkError.code !== '23505') {
          console.warn('Erro ao vincular à escola:', linkError);
        }
      }

      // 4. Marcar convite como aceito
      await supabase
        .from('teacher_invites')
        .update({ status: 'accepted' })
        .eq('invite_token', inviteToken);

      toast.success('Cadastro realizado com sucesso! Bem-vindo(a) ao TamanduAI!');

      // Aguardar 2s e redirecionar para login
      setTimeout(() => {
        navigate('/login?registered=true&email=' + encodeURIComponent(formData.email));
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado. Faça login.');
      } else {
        toast.error('Erro ao criar conta: ' + (error.message || 'Tente novamente'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (validatingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            <p className="text-center text-muted-foreground">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Convite Inválido</CardTitle>
            <CardDescription className="text-center">
              Este link de convite não é válido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/login')} variant="outline">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Cadastro de Professor
            </CardTitle>
            <CardDescription className="text-center text-purple-100">
              Você foi convidado para fazer parte da{' '}
              <strong className="text-white">{inviteData?.schools?.name || schoolName}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {inviteData?.schools?.name && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <School className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {inviteData.schools.name}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Você será vinculado automaticamente a esta escola
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 bg-white dark:bg-slate-900"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white whitespace-nowrap inline-flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Fazer Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterTeacherPage;
