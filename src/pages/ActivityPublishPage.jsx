import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/components/ui/use-toast';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  Users,
  Clock,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import NotificationOrchestrator from '@/services/notificationOrchestrator';
import NotificationService from '@/services/notificationService';

const ActivityPublishPage = () => {
  const { templateId, classId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishData, setPublishData] = useState({
    selectedClasses: classId ? [classId] : [],
    customTitle: '',
    customDescription: '',
    customInstructions: '',
    dueDate: null,
    maxPoints: 100
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Guardas: precisa de user e templateId
      if (!user || !user.id || !templateId) {
        setTemplate(null);
        setClasses([]);
        return;
      }

      // Carregar atividade (atua como template)
      const { data: templateData, error: templateError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', templateId)
        .eq('created_by', user.id)
        .single();

      if (templateError) throw templateError;
      setTemplate(templateData);

      // Carregar turmas do professor
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('created_by', user.id);

      if (classesError) throw classesError;
      setClasses(classesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar o template ou as turmas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [templateId, user?.id, toast]);

  const handlePublish = async () => {
    if (publishData.selectedClasses.length === 0) {
      toast({
        title: 'Selecione turmas',
        description: 'Selecione pelo menos uma turma para publicar a atividade.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPublishing(true);

      // Marcar como publicada
      const { error: publishError } = await supabase
        .from('activities')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          title: publishData.customTitle || undefined,
          description: publishData.customDescription || undefined,
          instructions: publishData.customInstructions || undefined,
          due_date: publishData.dueDate || undefined,
          total_points: publishData.maxPoints || undefined
        })
        .eq('id', templateId)
        .eq('created_by', user.id);

      if (publishError) throw publishError;

      // Vincular às turmas
      const { error: assignError } = await supabase
        .from('activity_class_assignments')
        .insert(
          publishData.selectedClasses.map(cId => ({
            activity_id: templateId,
            class_id: cId,
            assigned_at: new Date().toISOString()
          }))
        );

      if (assignError) throw assignError;

      // Notificações: enviar push para alunos das turmas selecionadas
      try {
        // Buscar alunos por turma
        for (const cId of publishData.selectedClasses) {
          // Descobrir nome da turma
          const classInfo = classes.find((c) => c.id === cId);
          const className = classInfo?.name || 'Sua turma';

          const { data: enrollments, error: enrollErr } = await supabase
            .from('class_members')
            .select('user_id')
            .eq('class_id', cId)
            .eq('role', 'student');

          if (enrollErr) throw enrollErr;

          const studentIds = (enrollments || []).map((e) => e.user_id);

          // Buscar emails dos alunos
          let emailsByUser = {};
          if (studentIds.length > 0) {
            const { data: profiles, error: profErr } = await supabase
              .from('profiles')
              .select('id, email, full_name')
              .in('id', studentIds);
            if (profErr) throw profErr;
            emailsByUser = Object.fromEntries((profiles || []).map(p => [p.id, { email: p.email, name: p.full_name }]));
          }

          // Enviar push para cada aluno
          const deadlineStr = publishData.dueDate
            ? format(publishData.dueDate, "PPP p", { locale: ptBR })
            : null;

          const variablesBase = {
            studentName: '', // opcional, pode-se preencher se disponível via perfis
            className,
            activityName: publishData.customTitle || template.title,
            deadline: deadlineStr || 'Sem prazo',
            points: publishData.maxPoints,
            activityUrl: `/dashboard/classes/${cId}/activities`
          };

          const sendOps = studentIds.map((sid) => {
            const target = emailsByUser[sid];
            return NotificationOrchestrator.send('newActivity', {
              userId: sid,
              email: target?.email || undefined,
              channelOverride: 'both',
              variables: { ...variablesBase, studentName: target?.name || '' },
              metadata: { classId: cId, templateId, kind: 'publish_activity' }
            });
          });

          await Promise.allSettled(sendOps);

          // Agendar lembrete de 24h se houver prazo
          if (publishData.dueDate) {
            const reminderOps = studentIds.map((sid) =>
              NotificationService.scheduleReminder({
                type: 'assignment',
                eventId: templateId,
                dueAt: publishData.dueDate,
                notification: {
                  title: '⏰ Prazo em 24 horas!',
                  message: `${variablesBase.activityName} vence em breve`,
                  type: 'assignment',
                  category: 'deadline',
                  priority: 'high',
                  metadata: { classId: cId, templateId, reminder24h: true }
                },
                remindBeforeMinutes: 24 * 60,
                userId: sid
              })
            );

            await Promise.allSettled(reminderOps);

            // Lembrete 1h antes
            const reminder1hOps = studentIds.map((sid) =>
              NotificationService.scheduleReminder({
                type: 'assignment',
                eventId: templateId,
                dueAt: publishData.dueDate,
                notification: {
                  title: '⚠️ URGENTE: Prazo em 1 hora!',
                  message: `${variablesBase.activityName} vence em 1 hora`,
                  type: 'assignment',
                  category: 'deadline',
                  priority: 'urgent',
                  metadata: { classId: cId, templateId, reminder1h: true }
                },
                remindBeforeMinutes: 60,
                userId: sid
              })
            );

            await Promise.allSettled(reminder1hOps);
          }
        }
      } catch (notifyErr) {
        console.warn('Falha ao enviar notificações pós-publicação:', notifyErr);
        // Não interrompe o fluxo principal
      }

      toast({
        title: 'Atividade publicada!',
        description: `A atividade foi publicada em ${publishData.selectedClasses.length} turma(s) com sucesso.`,
      });

      // Navegar para a gestão de atividades ou para uma turma específica
      if (classId) {
        navigate(`/dashboard/classes/${classId}/activities`);
      } else {
        navigate('/dashboard/activities');
      }
    } catch (error) {
      console.error('Error publishing template:', error);
      toast({
        title: 'Erro ao publicar',
        description: 'Não foi possível publicar a atividade. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const toggleClassSelection = (classId) => {
    setPublishData(prev => {
      const isSelected = prev.selectedClasses.includes(classId);
      if (isSelected) {
        return {
          ...prev,
          selectedClasses: prev.selectedClasses.filter(id => id !== classId)
        };
      } else {
        return {
          ...prev,
          selectedClasses: [...prev.selectedClasses, classId]
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Template não encontrado</h3>
          <p className="text-gray-500 mb-4">O template que você está tentando acessar não existe ou você não tem permissão.</p>
          <Button onClick={() => navigate('/dashboard/activities')}>
            Voltar para Atividades
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard/activities')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">Publicar Atividade</h1>
                <p className="text-gray-600">Configure e publique &quot;{template.title}&quot; nas turmas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Template Original
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{template.title}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    )}
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Criado em {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurações de Publicação */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Publicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de Turmas */}
                  <div>
                    <Label className="text-base font-medium">Turmas</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Selecione as turmas onde deseja publicar esta atividade
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {classes.map((classItem) => (
                        <div key={classItem.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={`class-${classItem.id}`}
                            checked={publishData.selectedClasses.includes(classItem.id)}
                            onCheckedChange={() => toggleClassSelection(classItem.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`class-${classItem.id}`} className="font-medium cursor-pointer">
                              {classItem.name}
                            </Label>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {classItem.subject}
                              </span>
                              <span>{classItem.grade_level}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {classes.length === 0 && (
                      <p className="text-sm text-gray-500 italic">
                        Você não tem turmas para publicar atividades.
                      </p>
                    )}
                  </div>

                  {/* Personalizações */}
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Personalizações (Opcional)</h4>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customTitle">Título personalizado</Label>
                        <Input
                          id="customTitle"
                          value={publishData.customTitle}
                          onChange={(e) => setPublishData(prev => ({ ...prev, customTitle: e.target.value }))}
                          placeholder={template.title}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customDescription">Descrição personalizada</Label>
                        <Textarea
                          id="customDescription"
                          value={publishData.customDescription}
                          onChange={(e) => setPublishData(prev => ({ ...prev, customDescription: e.target.value }))}
                          placeholder={template.description || 'Sem descrição'}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="customInstructions">Instruções personalizadas</Label>
                        <Textarea
                          id="customInstructions"
                          value={publishData.customInstructions}
                          onChange={(e) => setPublishData(prev => ({ ...prev, customInstructions: e.target.value }))}
                          placeholder="Adicione instruções específicas para esta turma..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxPoints">Pontuação máxima</Label>
                          <Input
                            id="maxPoints"
                            type="number"
                            min="1"
                            max="1000"
                            value={publishData.maxPoints}
                            onChange={(e) => setPublishData(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 100 }))}
                          />
                        </div>

                        <div>
                          <Label>Data de entrega (opcional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {publishData.dueDate ? (
                                  format(publishData.dueDate, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecionar data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={publishData.dueDate}
                                onSelect={(date) => setPublishData(prev => ({ ...prev, dueDate: date }))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/activities')}
                      disabled={publishing}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={publishing || publishData.selectedClasses.length === 0}
                    >
                      {publishing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Publicar em {publishData.selectedClasses.length} turma{publishData.selectedClasses.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityPublishPage;
