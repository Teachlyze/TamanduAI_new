import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';
import { Loader2, FileText, Code, List, CheckSquare, UploadCloud, Image as ImageIcon, ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import ActivityForm from '@/components/ActivityForm/ActivityForm';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityDrafts } from '../hooks/useActivityDrafts';

const CreateActivityPage = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [isPageReady, setIsPageReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use Redis cache for drafts
  const { drafts, saveDraft, loading: draftsLoading } = useActivityDrafts(user?.id);

  // Auto-save functionality
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [_, setLastSaved] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    points: 10,
    questions: [],
    image: null,
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(async () => {
      if (formData.title || formData.description || formData.questions.length > 0) {
        try {
          await saveDraft({
            id: `draft_${user?.id}_${Date.now()}`,
            ...formData,
            classId: classId || null,
            lastModified: new Date().toISOString(),
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // 30 seconds

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData, classId, user?.id, saveDraft, autoSaveTimer]);

  // Load draft on component mount
  useEffect(() => {
    const loadExistingDraft = async () => {
      if (drafts.length > 0) {
        // Load the most recent draft
        const latestDraft = drafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        if (latestDraft) {
          setFormData({
            title: latestDraft.title || '',
            description: latestDraft.description || '',
            instructions: latestDraft.instructions || '',
            dueDate: latestDraft.dueDate || '',
            points: latestDraft.points || 10,
            questions: latestDraft.questions || [],
            image: latestDraft.image || null,
          });
        }
      }
    };

    if (!draftsLoading && user?.id) {
      loadExistingDraft();
    }
  }, [drafts, draftsLoading, user?.id]);

  // Handle authentication and page readiness
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      return;
    } else if (!classId) {
      console.log('Creating activity without specific class');
    }

    setIsPageReady(true);
  }, [user, authLoading, classId]);

  const handleSubmit = useCallback(async (submittedFormData) => {
    setIsSubmitting(true);
    try {
      const { image, ...activityData } = submittedFormData;
      
      // Handle image upload if needed
      if (image?.file) {
        // Image processing would go here
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const templateData = {
        title: activityData.title || 'Nova Atividade',
        description: activityData.description || null,
        instructions: activityData.instructions || null,
        schema: activityData.questions ? JSON.stringify({
          title: activityData.title || 'Nova Atividade',
          type: 'object',
          properties: {},
          required: []
        }) : null,
        ui_schema: activityData.questions ? JSON.stringify({}) : null,
        created_by: user.id,
        is_public: false,
        tags: []
      };

      const { data: template, error: templateError } = await supabase
        .from('activity_templates')
        .insert([templateData])
        .select()
        .single();

      if (templateError) throw templateError;

      if (classId) {
        const { error: publishError } = await supabase.rpc('publish_activity_template', {
          template_id_param: template.id,
          class_ids: [classId],
          custom_title: activityData.title || null,
          custom_description: activityData.description || null,
          custom_instructions: activityData.instructions || null,
          custom_due_date: activityData.dueDate || null,
          custom_max_points: activityData.points || 100
        });

        if (publishError) {
          console.warn('Error publishing to class:', publishError);
        }
      }

      toast({
        title: '✅ Atividade criada com sucesso!',
        description: 'Sua atividade foi salva e está disponível para os alunos.',
      });

      navigate('/dashboard/activities');
    } catch (error) {
      console.error('[CreateActivityPage] Error creating activity:', error);

      let errorMessage = 'Ocorreu um erro ao tentar salvar a atividade.';

      if (error.message.includes('Database error')) {
        errorMessage = 'Erro no banco de dados. Verifique sua conexão com a internet e tente novamente.';
      } else if (error.message.includes('User not authenticated')) {
        errorMessage = 'Você precisa estar logado para criar uma atividade.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
      }

      toast({
        title: '❌ Erro ao criar atividade',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [classId, toast, navigate, user]);

  // Show loading state while checking auth or page is not ready
  if (authLoading || !isPageReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
            <Loader2 className="relative h-16 w-16 text-blue-500 animate-spin mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            {authLoading ? 'Verificando autenticação...' : 'Preparando ambiente...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Criar Nova Atividade
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {classId
                        ? 'Crie uma atividade interativa para seus alunos'
                        : 'Crie uma atividade geral ou selecione uma turma específica'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/activities')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Dicas para uma boa atividade</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Use títulos claros e descritivos</li>
                    <li>• Adicione perguntas variadas para engajar os alunos</li>
                    <li>• Defina uma data de entrega realista</li>
                    <li>• Inclua instruções detalhadas quando necessário</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ActivityForm
            initialData={formData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CreateActivityPage;
