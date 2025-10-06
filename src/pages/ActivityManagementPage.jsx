import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from '@/components/ui/use-toast';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  BookOpen,
  Users,
  Calendar,
  Star,
  Filter,
  Search
} from 'lucide-react';

const ActivityManagementPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, drafts
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [publishData, setPublishData] = useState({
    selectedClasses: [],
    customTitle: '',
    customDescription: '',
    customInstructions: '',
    dueDate: '',
    maxPoints: 100
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Carregar templates do usuário
      const { data: templatesData, error: templatesError } = await supabase
        .from('activity_templates')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Carregar turmas do professor
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', user.id);

      if (classesError) throw classesError;
      setClasses(classesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as atividades e turmas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('activity_templates')
        .delete()
        .eq('id', templateId)
        .eq('created_by', user.id);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o template.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishTemplate = async () => {
    if (publishData.selectedClasses.length === 0) {
      toast({
        title: 'Selecione turmas',
        description: 'Selecione pelo menos uma turma para publicar a atividade.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('publish_activity_template', {
        template_id_param: selectedTemplate.id,
        class_ids: publishData.selectedClasses,
        custom_title: publishData.customTitle || null,
        custom_description: publishData.customDescription || null,
        custom_instructions: publishData.customInstructions || null,
        custom_due_date: publishData.dueDate || null,
        custom_max_points: publishData.maxPoints
      });

      if (error) throw error;

      toast({
        title: 'Atividade publicada!',
        description: `A atividade foi publicada em ${publishData.selectedClasses.length} turma(s).`,
      });

      setPublishDialogOpen(false);
      setSelectedTemplate(null);
      setPublishData({
        selectedClasses: [],
        customTitle: '',
        customDescription: '',
        customInstructions: '',
        dueDate: '',
        maxPoints: 100
      });

      // Recarregar dados
      loadData();
    } catch (error) {
      console.error('Error publishing template:', error);
      toast({
        title: 'Erro ao publicar',
        description: 'Não foi possível publicar a atividade.',
        variant: 'destructive',
      });
    }
  };

  const openPublishDialog = (template) => {
    setSelectedTemplate(template);
    setPublishDialogOpen(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && template.is_public) ||
                         (filter === 'drafts' && !template.is_public);
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">TamanduAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/dashboard/activities/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Minhas Atividades</h2>
            <p className="text-gray-600">
              Gerencie seus templates de atividades e publique-os nas turmas
            </p>
          </div>

          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar atividades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="drafts">Rascunhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {template.title}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/activities/edit/${template.id}`)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openPublishDialog(template)}
                        title="Publicar"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.description || 'Sem descrição'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={template.is_public ? "default" : "secondary"}>
                          {template.is_public ? "Público" : "Rascunho"}
                        </Badge>
                        {template.tags && template.tags.length > 0 && (
                          <Badge variant="outline">
                            {template.tags.length} tag(s)
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Criado em {new Date(template.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma atividade encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira atividade.'}
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/dashboard/activities/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Atividade
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Publicação */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publicar Atividade</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedTemplate.title}</h4>
                <p className="text-sm text-gray-600">
                  Selecione as turmas onde deseja publicar esta atividade
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="classes">Turmas</Label>
                  <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                    {classes.map((classItem) => (
                      <div key={classItem.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`class-${classItem.id}`}
                          checked={publishData.selectedClasses.includes(classItem.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPublishData(prev => ({
                                ...prev,
                                selectedClasses: [...prev.selectedClasses, classItem.id]
                              }));
                            } else {
                              setPublishData(prev => ({
                                ...prev,
                                selectedClasses: prev.selectedClasses.filter(id => id !== classItem.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`class-${classItem.id}`} className="text-sm">
                          {classItem.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customTitle">Título personalizado (opcional)</Label>
                  <Input
                    id="customTitle"
                    value={publishData.customTitle}
                    onChange={(e) => setPublishData(prev => ({ ...prev, customTitle: e.target.value }))}
                    placeholder={selectedTemplate.title}
                  />
                </div>

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
                  <Label htmlFor="dueDate">Data de entrega (opcional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={publishData.dueDate}
                    onChange={(e) => setPublishData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handlePublishTemplate}>
                  Publicar ({publishData.selectedClasses.length} turma{publishData.selectedClasses.length !== 1 ? 's' : ''})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityManagementPage;
