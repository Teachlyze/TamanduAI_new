import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Award,
  MessageSquare,
  Save,
  Send,
  ArrowLeft,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import plagiarismWinstonAI from '@/services/plagiarismWinstonAI';

const CorrectionsPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // console.log('[CorrectionsPage] Mounting with:', { activityId, userId: user?.id }, []); // TODO: Add dependencies
    
    if (!activityId) {
      console.error('[CorrectionsPage] No activityId provided');
      setLoading(false);
      toast.error('ID da atividade não fornecido');
      return;
    }
    
    if (!user) {
      console.error('[CorrectionsPage] No user found');
      setLoading(false);
      return;
    }
    
    loadActivityAndSubmissions();
  }, [activityId, user]);

  const loadActivityAndSubmissions = async () => {
    // console.log('[CorrectionsPage] Loading data for activity:', activityId);
    
    try {
      setLoading(true);

      // Timeout de 15 segundos para a query
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao carregar dados')), 15000)
      );

      // Buscar atividade
      // console.log('[CorrectionsPage] Fetching activity...');
      const activityPromise = supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();
        
      const { data: activityData, error: activityError } = await Promise.race([
        activityPromise,
        timeoutPromise
      ]);

      if (activityError) {
        console.error('[CorrectionsPage] Activity error:', activityError);
        throw activityError;
      }
      
      // console.log('[CorrectionsPage] Activity loaded:', activityData?.title);
      setActivity(activityData);

      // Buscar submissões (sem nested profiles para evitar PGRST201)
      // console.log('[CorrectionsPage] Fetching submissions...');
      const submissionsPromise = supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activityId)
        .order('submitted_at', { ascending: false });
        
      const { data: submissionsData, error: submissionsError } = await Promise.race([
        submissionsPromise,
        timeoutPromise
      ]);

      if (submissionsError) {
        console.error('[CorrectionsPage] Submissions error:', submissionsError);
        throw submissionsError;
      }
      
      // console.log('[CorrectionsPage] Submissions loaded:', submissionsData?.length || 0);

      // Buscar dados dos alunos separadamente
      if (submissionsData && submissionsData.length > 0) {
        const studentIds = [...new Set(submissionsData.map(s => s.student_id))];
        const { data: students } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', studentIds);

        // Buscar relatórios de plágio
        const submissionIds = submissionsData.map(s => s.id);
        const { data: plagiarismReports } = await supabase
          .from('plagiarism_reports')
          .select('*')
          .in('submission_id', submissionIds);

        // Combinar dados
        submissionsData.forEach(sub => {
          sub.student = students?.find(st => st.id === sub.student_id);
          sub.plagiarism_reports = plagiarismReports?.filter(pr => pr.submission_id === sub.id) || [];
        });
      }

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      // Selecionar primeira submissão não corrigida
      const firstUncorrected = submissionsData?.find(s => !s.grade);
      if (firstUncorrected) {
        selectSubmission(firstUncorrected);
      }

    } catch (error) {
      console.error('[CorrectionsPage] Error loading:', error);
      
      let errorMessage = 'Erro ao carregar correções';
      if (error.message === 'Timeout ao carregar dados') {
        errorMessage = 'A operação está demorando muito. Tente novamente.';
      } else if (error.code) {
        errorMessage = `Erro ${error.code}: ${error.message}`;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        action: {
          label: 'Tentar novamente',
          onClick: () => loadActivityAndSubmissions()
        }
      });
    } finally {
      // console.log('[CorrectionsPage] Setting loading to false');
      setLoading(false);
    }
  };

  const selectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
  };

  const saveCorrection = async (notify = false) => {
    if (!selectedSubmission) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('submissions')
        .update({
          grade: parseFloat(grade) || null,
          feedback: feedback || null,
          graded_at: new Date().toISOString(),
          graded_by: user.id
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      // Notificar aluno se solicitado
      if (notify) {
        await supabase.from('notifications').insert([{
          user_id: selectedSubmission.student_id,
          type: 'grade',
          title: 'Nova Nota Disponível',
          message: `Sua nota para "${activity.title}" foi publicada: ${grade}`,
          link: `/dashboard/activities/${activityId}`
        }]);
      }

      toast.success(notify ? 'Correção salva e aluno notificado' : 'Correção salva');

      // Atualizar lista
      loadActivityAndSubmissions();

    } catch (error) {
      console.error('Erro ao salvar correção:', error);
      toast.error('Erro ao salvar correção');
    } finally {
      setSaving(false);
    }
  };

  const checkPlagiarism = async () => {
    if (!selectedSubmission) return;

    try {
      toast.loading('Verificando plágio...', { id: 'plagiarism' });

      const result = await plagiarismWinstonAI.checkPlagiarism(
        selectedSubmission.content,
        activityId,
        selectedSubmission.student_id
      );

      toast.dismiss('plagiarism');

      if (result.success) {
        toast.success(`Plágio verificado: ${result.percentage}%`);
        loadActivityAndSubmissions(); // Recarregar para mostrar resultado
      } else {
        toast.error('Erro na verificação de plágio');
      }

    } catch (error) {
      toast.dismiss('plagiarism');
      toast.error('Erro ao verificar plágio');
    }
  };

  const stats = {
    total: submissions.length,
    corrected: submissions.filter(s => s.grade !== null).length,
    pending: submissions.filter(s => s.grade === null).length,
    averageGrade: submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / submissions.filter(s => s.grade).length || 0
  };

  if (loading) {
    return <LoadingScreen message="Carregando correções..." />;
  }

  if (!activity) {
    return (
      <EmptyState
        icon={FileText}
        title="Atividade não encontrada"
        description="A atividade que você está procurando não existe."
        actionLabel="Voltar para Atividades"
        onAction={() => navigate('/dashboard/activities')}
      />
    );
  }

  const breadcrumbItems = [
    { label: 'Atividades', path: '/dashboard/activities' },
    { label: activity.title, path: `/dashboard/activities/${activityId}` },
    { label: 'Correções', path: `/dashboard/activities/${activityId}/corrections` }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard/activities')}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Correção de Atividades</h1>
          </div>
          <p className="text-muted-foreground">{activity.title}</p>
        </div>
        <PremiumButton
          variant="outline"
          leftIcon={Download}
        >
          Exportar Notas
        </PremiumButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Submissões</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.corrected}</p>
              <p className="text-sm text-muted-foreground">Corrigidas</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard variant="elevated" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.averageGrade.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Submissões */}
        <div className="lg:col-span-1">
          <PremiumCard variant="elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold">Submissões ({submissions.length})</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma submissão ainda
                </div>
              ) : (
                submissions.map((submission) => (
                  <button
                    key={submission.id}
                    onClick={() => selectSubmission(submission)}
                    className={`w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left ${
                      selectedSubmission?.id === submission.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {submission.student?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {submission.student?.full_name || 'Aluno'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.submitted_at).toLocaleString('pt-BR')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {submission.grade !== null ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Nota: {submission.grade}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              Pendente
                            </span>
                          )}
                          {submission.plagiarism_reports?.length > 0 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                              ⚠️ {submission.plagiarism_reports[0].plagiarism_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Área de Correção */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <PremiumCard variant="elevated" className="p-6">
              <div className="space-y-6">
                {/* Info do Aluno */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {selectedSubmission.student?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="font-bold">{selectedSubmission.student?.full_name || 'Aluno'}</p>
                      <p className="text-sm text-muted-foreground">{selectedSubmission.student?.email}</p>
                    </div>
                  </div>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    leftIcon={AlertTriangle}
                    onClick={checkPlagiarism}
                  >
                    Verificar Plágio
                  </PremiumButton>
                </div>

                {/* Relatório de Plágio */}
                {selectedSubmission.plagiarism_reports?.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-red-900 dark:text-red-100">
                          Plágio Detectado: {selectedSubmission.plagiarism_reports[0].plagiarism_percentage}%
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          Fontes: {selectedSubmission.plagiarism_reports[0].sources?.length || 0} encontrada(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conteúdo da Submissão */}
                <div>
                  <label className="block text-sm font-medium mb-2">Submissão do Aluno</label>
                  <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{selectedSubmission.content}</p>
                  </div>
                </div>

                {/* Nota */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nota (0-10)</label>
                  <PremiumInput
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Ex: 8.5"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium mb-2">Feedback para o Aluno</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Escreva seu feedback detalhado aqui..."
                  />
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3">
                  <PremiumButton
                    variant="outline"
                    leftIcon={Save}
                    onClick={() => saveCorrection(false)}
                    disabled={saving}
                  >
                    Salvar Rascunho
                  </PremiumButton>
                  <PremiumButton
                    variant="gradient"
                    leftIcon={Send}
                    onClick={() => saveCorrection(true)}
                    disabled={saving || !grade}
                  >
                    Salvar e Notificar Aluno
                  </PremiumButton>
                </div>
              </div>
            </PremiumCard>
          ) : (
            <PremiumCard variant="elevated" className="p-12">
              <EmptyState
                icon={FileText}
                title="Selecione uma submissão"
                description="Escolha uma submissão da lista para iniciar a correção"
              />
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrectionsPage;
