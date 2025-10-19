import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import toast from 'react-hot-toast';

export default function JoinClassWithCodePage() {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [manualCode, setManualCode] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const codeToUse = code || searchParams.get('code') || manualCode;

  useEffect(() => {
    if (codeToUse && !authLoading) {
      loadClassroom(codeToUse);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [codeToUse, authLoading]);

  const loadClassroom = async (inviteCode) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('classes')
        .select(`
          *,
          profiles:created_by (
            id,
            full_name,
            email
          ),
          _count:class_members(count)
        `)
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (fetchError) throw new Error('Código de convite inválido');

      setClassroom(data);
    } catch (err) {
      console.error('Erro ao buscar turma:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      navigate(`/login?redirect=/join-class/${codeToUse}`);
      return;
    }

    try {
      setJoining(true);

      // Verificar se já está na turma
      const { data: existing } = await supabase
        .from('class_members')
        .select('id')
        .eq('class_id', classroom.id)
        .eq('user_id', user.id)
        .eq('role', 'student')
        .single();

      if (existing) {
        toast.error('Você já está nesta turma');
        navigate(`/dashboard/classes/${classroom.id}`);
        return;
      }

      // Adicionar à turma
      const { error: insertError } = await supabase
        .from('class_members')
        .insert({
          class_id: classroom.id,
          user_id: user.id,
          role: 'student',
          joined_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Criar notificação para o professor
      await supabase.from('notifications').insert({
        user_id: classroom.created_by,
        type: 'new_student',
        title: '👋 Novo Aluno na Turma',
        message: `Um novo aluno entrou na turma ${classroom.name}`,
        data: {
          classId: classroom.id,
          studentId: user.id
        },
        read: false
      });

      setSuccess(true);
      toast.success('Você entrou na turma com sucesso!');

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/dashboard/classes/${classroom.id}`);
      }, 2000);
    } catch (err) {
      console.error('Erro ao entrar na turma:', err);
      toast.error('Erro ao entrar na turma');
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PremiumCard variant="elevated" className="max-w-md">
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo à Turma!</h2>
              <p className="text-muted-foreground mb-4">
                Você foi adicionado à turma {classroom?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecionando...
              </p>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    );
  }

  if (!codeToUse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <PremiumCard variant="elevated">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Entrar em uma Turma</h1>
                <p className="text-muted-foreground">
                  Digite o código de convite fornecido pelo professor
                </p>
              </div>

              <div className="space-y-4">
                <PremiumInput
                  label="Código de Convite"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="Ex: MAT-ABC123"
                  maxLength={12}
                  className="text-center font-mono text-lg"
                  autoFocus
                />

                <PremiumButton
                  variant="gradient"
                  className="w-full"
                  onClick={() => loadClassroom(manualCode)}
                  disabled={!manualCode || manualCode.length < 6}
                  rightIcon={ArrowRight}
                >
                  Buscar Turma
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <PremiumCard variant="elevated" className="max-w-md">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold mb-2">Código Inválido</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'Não encontramos uma turma com este código de convite.'}
              </p>
              <PremiumButton
                variant="outline"
                onClick={() => {
                  setError(null);
                  setManualCode('');
                  navigate('/join-class');
                }}
              >
                Tentar Novamente
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <PremiumCard variant="elevated">
          <div className="p-8">
            {/* Banner da Turma */}
            <div className={`h-32 rounded-xl bg-gradient-to-br ${classroom.banner_color || 'from-blue-500 to-purple-500'} mb-6 flex items-center justify-center`}>
              <Users className="w-16 h-16 text-white" />
            </div>

            {/* Informações */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
              <p className="text-muted-foreground mb-4">{classroom.subject}</p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>👨‍🏫 {classroom.professor?.name}</span>
                <span>•</span>
                <span>👥 {classroom._count?.count || 0} alunos</span>
              </div>
            </div>

            {/* Descrição */}
            {classroom.description && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{classroom.description}</p>
              </div>
            )}

            {/* Horário */}
            {classroom.schedule && (
              <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <span>📅</span>
                <span>{classroom.schedule}</span>
              </div>
            )}

            {/* Botão de Entrar */}
            <PremiumButton
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={handleJoinClass}
              disabled={joining}
              rightIcon={joining ? Loader2 : ArrowRight}
            >
              {joining ? 'Entrando...' : 'Entrar na Turma'}
            </PremiumButton>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-4">
                Você será redirecionado para fazer login
              </p>
            )}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
}
