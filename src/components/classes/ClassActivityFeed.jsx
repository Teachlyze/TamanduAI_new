import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  FileText,
  Eye,
  User,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ClassActivityFeed = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar dados da turma
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      setClassData(classData);

      // Verificar se o usuário é professor da turma
      setIsTeacher(classData.teacher_id === user.id);

      // Carregar atividades publicadas na turma
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('class_activities')
        .select(`
          *,
          template:activity_templates(*)
        `)
        .eq('class_id', classId)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Se for professor, carregar seus templates
      if (isTeacher) {
        const { data: templatesData, error: templatesError } = await supabase
          .from('activity_templates')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (templatesError) throw templatesError;
        setTemplates(templatesData || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as informações da turma.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitActivity = async (activityId) => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          activity_id: activityId,
          student_id: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Submissão iniciada',
        description: 'Você pode agora responder à atividade.',
      });

      // Atualizar lista de atividades para mostrar status
      setActivities(activities.map(activity =>
        activity.id === activityId
          ? { ...activity, has_submission: true }
          : activity
      ));
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast({
        title: 'Erro ao iniciar submissão',
        description: 'Não foi possível iniciar a submissão da atividade.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Publicada';
      case 'draft': return 'Rascunho';
      case 'archived': return 'Arquivada';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando atividades...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Turma não encontrada</h3>
          <p className="text-gray-500 mb-4">A turma que você está procurando não existe ou você não tem acesso.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
                  <p className="text-gray-600">
                    {classData.subject} • {classData.grade_level}
                  </p>
                </div>
              </div>
              {isTeacher && (
                <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Publicar Atividade
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Publicar Nova Atividade</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Selecione um template</Label>
                        <Select onValueChange={(templateId) => {
                          const template = templates.find(t => t.id === templateId);
                          setSelectedTemplate(template);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedTemplate && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium">{selectedTemplate.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedTemplate.description || 'Sem descrição'}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            if (selectedTemplate) {
                              navigate(`/dashboard/activities/publish/${selectedTemplate.id}?classId=${classId}`);
                            }
                          }}
                          disabled={!selectedTemplate}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Atividades da Turma</h2>
            <p className="text-gray-600">
              {isTeacher
                ? 'Gerencie as atividades publicadas para seus alunos'
                : 'Visualize e responda às atividades da turma'
              }
            </p>
          </div>

          {/* Lista de Atividades */}
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {activity.title}
                      </CardTitle>
                      {activity.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                      {isTeacher && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Visualizar"
                          onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {activity.due_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Entrega: {formatDate(activity.due_date)}
                      </div>
                    )}
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      Pontuação máxima: {activity.max_points}
                    </div>
                    {activity.published_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Publicada: {formatDate(activity.published_at)}
                      </div>
                    )}
                  </div>

                  {activity.instructions && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-1">Instruções:</h5>
                      <p className="text-blue-800 text-sm">{activity.instructions}</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Template: {activity.template?.title || 'Desconhecido'}
                    </div>

                    {!isTeacher && (
                      <div className="flex space-x-2">
                        {activity.has_submission ? (
                          <Button variant="outline" onClick={() => navigate(`/dashboard/activities/${activity.id}/submit`)}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Continuar Resposta
                          </Button>
                        ) : (
                          <Button onClick={() => handleSubmitActivity(activity.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Responder Atividade
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {isTeacher ? 'Nenhuma atividade publicada' : 'Nenhuma atividade disponível'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isTeacher
                  ? 'Publique uma atividade para seus alunos começarem.'
                  : 'Aguarde seu professor publicar atividades.'
                }
              </p>
              {isTeacher && (
                <div className="mt-6">
                  <Button onClick={() => setPublishDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Publicar Primeira Atividade
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClassActivityFeed;
