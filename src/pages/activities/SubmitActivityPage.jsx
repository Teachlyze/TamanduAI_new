import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Paperclip,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Calendar,
  Award
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import plagiarismWinstonAI from '@/services/plagiarismWinstonAI';

const SubmitActivityPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activity, setActivity] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (activityId && user) {
      loadActivity();
    }
  }, [activityId, user]);

  const loadActivity = async () => {
    try {
      setLoading(true);

      // Buscar atividade
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select(`
          *,
          class:classes(name)
        `)
        .eq('id', activityId)
        .single();

      if (activityError) throw activityError;
      setActivity(activityData);

      // Verificar se já existe submissão
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activityId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (submissionError) throw submissionError;

      if (submissionData) {
        setExistingSubmission(submissionData);
        setContent(submissionData.content || '');
      }

    } catch (error) {
      console.error('Erro ao carregar atividade:', error);
      toast.error('Erro ao carregar atividade');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (submissionId) => {
    const uploadedUrls = [];

    for (const file of attachments) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${submissionId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('submissions')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload:', error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      uploadedUrls.push({
        name: file.name,
        url: urlData.publicUrl,
        type: file.type
      });
    }

    return uploadedUrls;
  };

  const submitActivity = async () => {
    if (!content.trim()) {
      toast.error('Por favor, escreva sua resposta');
      return;
    }

    try {
      setSubmitting(true);

      let submissionId = existingSubmission?.id;

      if (existingSubmission) {
        // Atualizar submissão existente
        const { error } = await supabase
          .from('submissions')
          .update({
            content,
            submitted_at: new Date().toISOString(),
            status: 'submitted'
          })
          .eq('id', existingSubmission.id);

        if (error) throw error;
      } else {
        // Criar nova submissão
        const { data: newSubmission, error } = await supabase
          .from('submissions')
          .insert([{
            activity_id: activityId,
            student_id: user.id,
            content,
            submitted_at: new Date().toISOString(),
            status: 'submitted'
          }])
          .select()
          .single();

        if (error) throw error;
        submissionId = newSubmission.id;
      }

      // Upload de anexos
      if (attachments.length > 0) {
        const uploadedUrls = await uploadAttachments(submissionId);
        
        await supabase
          .from('submissions')
          .update({ attachments: uploadedUrls })
          .eq('id', submissionId);
      }

      // Verificação automática de plágio
      toast.loading('Verificando plágio...', { id: 'plagiarism' });
      
      await plagiarismWinstonAI.checkPlagiarism(
        content,
        activityId,
        user.id
      );

      toast.dismiss('plagiarism');

      // Notificar professor
      const { data: activityData } = await supabase
        .from('activities')
        .select('created_by, title')
        .eq('id', activityId)
        .single();

      if (activityData) {
        await supabase.from('notifications').insert([{
          user_id: activityData.created_by,
          type: 'submission',
          title: 'Nova Submissão',
          message: `${user.full_name || user.email} enviou a atividade "${activityData.title}"`,
          link: `/dashboard/activities/${activityId}/corrections`
        }]);
      }

      toast.success('Atividade enviada com sucesso!');
      navigate('/dashboard/activities');

    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao enviar atividade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando atividade..." />;
  }

  if (!activity) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h2 className="text-xl font-bold mb-2">Atividade não encontrada</h2>
        <PremiumButton onClick={() => navigate('/dashboard/activities')}>
          Voltar para Atividades
        </PremiumButton>
      </div>
    );
  }

  const isPastDue = activity.due_date && new Date(activity.due_date) < new Date();
  const canSubmit = !isPastDue || activity.allow_late_submission;

  const breadcrumbItems = [
    { label: 'Atividades', path: '/dashboard/activities' },
    { label: activity.title, path: `/dashboard/activities/${activityId}` },
    { label: 'Submissão', path: `/dashboard/activities/${activityId}/submit` }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold">Enviar Atividade</h1>
          </div>
          <p className="text-muted-foreground">{activity.title}</p>
        </div>
      </div>

      {/* Activity Info */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Descrição</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {activity.description || 'Sem descrição'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prazo</p>
                <p className="font-medium">
                  {activity.due_date
                    ? new Date(activity.due_date).toLocaleDateString('pt-BR')
                    : 'Sem prazo'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pontuação</p>
                <p className="font-medium">{activity.max_score || 10} pontos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Turma</p>
                <p className="font-medium">{activity.class?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Deadline Warning */}
      {isPastDue && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900 dark:text-orange-100">
                Prazo Expirado
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                {canSubmit
                  ? 'Esta atividade aceita submissões atrasadas, mas pode haver penalidades.'
                  : 'O prazo para esta atividade já passou e não são mais aceitas submissões.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Already Submitted */}
      {existingSubmission && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-900 dark:text-green-100">
                Você já enviou esta atividade
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                Enviado em {new Date(existingSubmission.submitted_at).toLocaleString('pt-BR')}
                {existingSubmission.grade !== null && ` • Nota: ${existingSubmission.grade}`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submission Form */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua Resposta <span className="text-destructive">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Digite sua resposta aqui..."
              disabled={!canSubmit}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {content.length} caracteres
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Anexos (Opcional)
            </label>
            
            {attachments.length > 0 && (
              <div className="space-y-2 mb-4">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 rounded hover:bg-background"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={!canSubmit}
            />
            <label
              htmlFor="attachments"
              className={`inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Paperclip className="w-4 h-4" />
              Adicionar Arquivos
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <PremiumButton
              variant="outline"
              onClick={() => navigate('/dashboard/activities')}
            >
              Cancelar
            </PremiumButton>
            <PremiumButton
              variant="gradient"
              leftIcon={Send}
              onClick={submitActivity}
              disabled={!canSubmit || !content.trim() || submitting}
            >
              {submitting
                ? 'Enviando...'
                : existingSubmission
                ? 'Reenviar Atividade'
                : 'Enviar Atividade'}
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default SubmitActivityPage;
