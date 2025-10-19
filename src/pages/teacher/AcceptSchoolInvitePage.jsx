import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';
import { School, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AcceptSchoolInvitePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, valid, invalid, expired, accepted

  useEffect(() => {
    if (!user) {
      // Salvar token e redirecionar para login
      localStorage.setItem('pending_school_invite', inviteToken);
      navigate(`/login?redirect=/teacher/accept-invite?token=${inviteToken}`);
      return;
    }

    validateInvite();
  }, [user, inviteToken]);

  const validateInvite = async () => {
    if (!inviteToken) {
      setError('Token de convite inválido');
      setStatus('invalid');
      setLoading(false);
      return;
    }

    try {
      // Buscar convite no banco
      const { data: invite, error: inviteError } = await supabase
        .from('teacher_invites')
        .select(`
          *,
          schools:school_id (
            id,
            name,
            logo_url,
            status
          )
        `)
        .eq('invite_token', inviteToken)
        .single();

      if (inviteError || !invite) {
        setError('Convite não encontrado');
        setStatus('invalid');
        setLoading(false);
        return;
      }

      // Verificar se já foi aceito
      if (invite.status === 'accepted') {
        setError('Este convite já foi aceito');
        setStatus('accepted');
        setLoading(false);
        return;
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        setError('Este convite expirou');
        setStatus('expired');
        setLoading(false);
        return;
      }

      // Verificar se escola está ativa
      if (invite.schools?.status !== 'active') {
        setError('Esta escola não está mais ativa');
        setStatus('invalid');
        setLoading(false);
        return;
      }

      // Verificar se já está afiliado
      const { data: existingLink } = await supabase
        .from('school_teachers')
        .select('id')
        .eq('school_id', invite.school_id)
        .eq('user_id', user.id)
        .single();

      if (existingLink) {
        setError('Você já está afiliado a esta escola');
        setStatus('accepted');
        setLoading(false);
        return;
      }

      setInviteData(invite);
      setStatus('valid');
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      setError('Erro ao validar convite');
      setStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !inviteData) return;

    setProcessing(true);

    try {
      // 1. Criar vínculo na tabela school_teachers
      const { error: linkError } = await supabase
        .from('school_teachers')
        .insert({
          school_id: inviteData.school_id,
          user_id: user.id,
          status: 'active',
          joined_at: new Date().toISOString(),
        });

      if (linkError) {
        if (linkError.code === '23505') {
          toast.error('Você já está afiliado a esta escola');
        } else {
          throw linkError;
        }
        return;
      }

      // 2. Marcar convite como aceito
      const { error: updateError } = await supabase
        .from('teacher_invites')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invite_token', inviteToken);

      if (updateError) {
        console.warn('Erro ao atualizar status do convite:', updateError);
      }

      toast.success(`Você agora faz parte da ${inviteData.schools.name}!`);
      
      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      toast.error('Erro ao processar convite. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-center text-muted-foreground">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'invalid' || status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-red-600">
                {status === 'expired' ? 'Convite Expirado' : 'Convite Inválido'}
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-yellow-200">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-yellow-600">Convite Já Aceito</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <School className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Convite de Escola
            </CardTitle>
            <CardDescription className="text-center text-emerald-100">
              Você foi convidado para fazer parte de uma escola
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* School Info Card */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-4">
                {inviteData?.schools?.logo_url ? (
                  <img 
                    src={inviteData.schools.logo_url} 
                    alt={inviteData.schools.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-emerald-200 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                    <School className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                    {inviteData?.schools?.name}
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Convite de professor
                  </p>
                </div>
              </div>
            </div>

            {/* Invite Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Expira em {new Date(inviteData?.expires_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Benefits Alert */}
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Benefícios:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Compartilhe turmas e analytics com a escola</li>
                  <li>Acesso a recursos e materiais da instituição</li>
                  <li>Integração com sistema de gestão escolar</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1 whitespace-nowrap inline-flex items-center justify-center gap-2"
                disabled={processing}
              >
                <XCircle className="w-4 h-4" />
                <span>Recusar</span>
              </Button>
              <Button
                onClick={handleAcceptInvite}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white whitespace-nowrap inline-flex items-center justify-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aceitar Convite</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AcceptSchoolInvitePage;
